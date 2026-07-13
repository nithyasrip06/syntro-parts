import type { Part } from "@/types/part";

const TOKEN_URL = "https://identity.nexar.com/connect/token";
const GRAPHQL_URL = "https://api.nexar.com/graphql";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.NEXAR_CLIENT_ID!,
      client_secret: process.env.NEXAR_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Nexar token error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

const SEARCH_QUERY = `
  query SearchParts($q: String!, $limit: Int) {
    supSearchMpn(q: $q, limit: $limit) {
      hits
      results {
        part {
          mpn
          manufacturer { name }
          shortDescription
          category { name }
          documentCollections {
            name
            documents { url name }
          }
          sellers {
            company { name homepageUrl }
            offers {
              sku
              inventoryLevel
              moq
              factoryLeadDays
              prices {
                quantity
                price
                currency
              }
            }
          }
        }
      }
    }
  }
`;

interface NexarSeller {
  company: { name: string; homepageUrl: string | null };
  offers: Array<{
    sku: string;
    inventoryLevel: number;
    moq: number | null;
    factoryLeadDays: number | null;
    prices: Array<{ quantity: number; price: number; currency: string }>;
  }>;
}

interface NexarPart {
  mpn: string;
  manufacturer: { name: string };
  shortDescription: string | null;
  category: { name: string } | null;
  documentCollections: Array<{ name: string; documents: Array<{ url: string; name: string }> }>;
  sellers: NexarSeller[];
}

// Search URLs are reliable regardless of SKU format; fall back to homepage.
function buildDistributorUrl(companyName: string, homepageUrl: string | null, sku: string): string | null {
  const enc = encodeURIComponent(sku);
  const known: Record<string, string> = {
    "DigiKey":    `https://www.digikey.com/products/en?keywords=${enc}`,
    "Mouser":     `https://www.mouser.com/Search/Refine?Keyword=${enc}`,
    "Arrow":      `https://www.arrow.com/en/search?q=${enc}`,
    "Avnet":      `https://www.avnet.com/shop/us/search-filter?q=${enc}`,
    "Newark":     `https://www.newark.com/search?st=${enc}`,
    "Farnell":    `https://www.farnell.com/search?st=${enc}`,
    "RS Components": `https://www.rs-online.com/web/c/?searchTerm=${enc}`,
    "Future Electronics": `https://www.futureelectronics.com/search/?&text=${enc}`,
    "Allied Electronics": `https://www.alliedelec.com/search/?q=${enc}`,
    "TTI":        `https://www.tti.com/content/ttiinc/en/apps/search.html#q=${enc}`,
  };
  return known[companyName] ?? homepageUrl ?? null;
}

// Prioritise a collection explicitly named "Datasheets", then fall back to
// any document whose name or URL suggests it's a datasheet PDF.
function extractDatasheetUrl(
  collections: Array<{ name: string; documents: Array<{ url: string; name: string }> }>
): string | null {
  if (!collections?.length) return null;

  // 1. Preferred: collection named "Datasheets"
  const datasheetCollection = collections.find(
    (c) => c.name?.toLowerCase().includes("datasheet")
  );
  const preferredDoc = datasheetCollection?.documents?.[0];
  if (preferredDoc?.url) return preferredDoc.url;

  // 2. Fallback: any document across all collections with datasheet in name or .pdf URL
  for (const col of collections) {
    for (const doc of col.documents ?? []) {
      if (doc.name?.toLowerCase().includes("datasheet") || doc.url?.toLowerCase().endsWith(".pdf")) {
        return doc.url;
      }
    }
  }

  return null;
}

export async function searchNexar(query: string, limit = 20): Promise<Part[]> {
  const token = await getToken();

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { q: query, limit } }),
  });

  if (!res.ok) {
    throw new Error(`Nexar GraphQL error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    const msg: string = json.errors[0].message ?? "Unknown Nexar error";
    throw new Error(msg);
  }

  const results: NexarPart[] = json.data?.supSearchMpn?.results?.map(
    (r: { part: NexarPart }) => r.part
  ) ?? [];

  const parts: Part[] = [];

  for (const nexarPart of results) {
    const datasheetUrl = extractDatasheetUrl(nexarPart.documentCollections);
    const manufacturerUrl = null; // SupCompany doesn't expose url in Nexar schema

    for (const seller of nexarPart.sellers) {
      for (const offer of seller.offers) {
        if (!offer.prices || offer.prices.length === 0) continue;

        const sortedPrices = [...offer.prices].sort((a, b) => a.quantity - b.quantity);
        const lowestPrice = sortedPrices[0];

        parts.push({
          mpn: nexarPart.mpn,
          manufacturer: nexarPart.manufacturer.name,
          manufacturerUrl,
          description: nexarPart.shortDescription ?? "",
          distributor: seller.company.name,
          distributorSku: offer.sku,
          distributorUrl: buildDistributorUrl(seller.company.name, seller.company.homepageUrl, offer.sku),
          unitPrice: lowestPrice.price,
          currency: lowestPrice.currency,
          priceBreaks: sortedPrices.map((p) => ({
            quantity: p.quantity,
            unitPrice: p.price,
            currency: p.currency,
          })),
          stockQty: offer.inventoryLevel ?? 0,
          leadTimeDays: offer.factoryLeadDays ?? null,
          datasheetUrl,
          category: nexarPart.category?.name ?? null,
          source: "nexar",
        });
      }
    }
  }

  // Only return in-stock offers with a working URL, sorted by price then lead time.
  return parts
    .filter(p => p.stockQty > 0 && p.distributorUrl !== null)
    .sort((a, b) => {
      const pa = a.unitPrice ?? Infinity;
      const pb = b.unitPrice ?? Infinity;
      if (pa !== pb) return pa - pb;
      const la = a.leadTimeDays ?? Infinity;
      const lb = b.leadTimeDays ?? Infinity;
      return la - lb;
    })
    .slice(0, 10);
}
