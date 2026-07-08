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
            documents { url name }
          }
          sellers {
            company { name homepage }
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
  company: { name: string; homepage: string | null };
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
  documentCollections: Array<{ documents: Array<{ url: string; name: string }> }>;
  sellers: NexarSeller[];
}

function buildDistributorUrl(companyName: string, homepage: string | null, sku: string): string | null {
  if (homepage) {
    const knownUrls: Record<string, string> = {
      "DigiKey": `https://www.digikey.com/en/products/detail/-/-/${sku}`,
      "Mouser": `https://www.mouser.com/ProductDetail/${sku}`,
      "Arrow": `https://www.arrow.com/en/products/${sku}`,
      "Avnet": `https://www.avnet.com/shop/us/search-filter?q=${encodeURIComponent(sku)}`,
    };
    return knownUrls[companyName] ?? homepage;
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
  const results: NexarPart[] = json.data?.supSearchMpn?.results?.map(
    (r: { part: NexarPart }) => r.part
  ) ?? [];

  const parts: Part[] = [];

  for (const nexarPart of results) {
    const datasheetUrl =
      nexarPart.documentCollections?.[0]?.documents?.find(
        (d) => d.name?.toLowerCase().includes("datasheet") || d.url?.endsWith(".pdf")
      )?.url ?? null;

    for (const seller of nexarPart.sellers) {
      for (const offer of seller.offers) {
        if (!offer.prices || offer.prices.length === 0) continue;

        const sortedPrices = [...offer.prices].sort((a, b) => a.quantity - b.quantity);
        const lowestPrice = sortedPrices[0];

        parts.push({
          mpn: nexarPart.mpn,
          manufacturer: nexarPart.manufacturer.name,
          description: nexarPart.shortDescription ?? "",
          distributor: seller.company.name,
          distributorSku: offer.sku,
          distributorUrl: buildDistributorUrl(seller.company.name, seller.company.homepage, offer.sku),
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

  return parts;
}
