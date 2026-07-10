import type { AlibabaSupplier } from "@/types/part";

// Actor: devcake/alibaba-products-scraper (apify.com/store)
// Input:  { queries: string[], maxItems: number }
// Output fields confirmed from live API response
const ACTOR_ID = "devcake~alibaba-products-scraper";
const APIFY_BASE = "https://api.apify.com/v2";

interface ApifyRawItem {
  company_name?: string;
  name?: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  moq?: number;
  product_url?: string;
  main_image?: string;
  supplier_service_score?: number;
  review_score?: number;
  delivery_estimate?: string;
  dispatch_time?: string;
}

function parseLeadDays(raw: ApifyRawItem): { min: number; max: number } {
  const str = raw.delivery_estimate ?? raw.dispatch_time ?? "";
  const nums = str.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: 15, max: 45 };
}

export function normalizeApifyItems(items: ApifyRawItem[]): AlibabaSupplier[] {
  return items
    .filter((item) => item.company_name && item.name)
    .sort((a, b) => (b.supplier_service_score ?? 0) - (a.supplier_service_score ?? 0))
    .slice(0, 3)
    .map((item) => {
      const lead = parseLeadDays(item);
      return {
        supplierName: item.company_name!,
        productTitle: item.name!,
        priceMin: item.price_min ?? 0,
        priceMax: item.price_max ?? item.price_min ?? 0,
        currency: item.currency ?? "USD",
        moq: item.moq ?? 1,
        leadTimeMin: lead.min,
        leadTimeMax: lead.max,
        supplierRating: item.supplier_service_score ?? item.review_score ?? null,
        productUrl: item.product_url ?? "https://www.alibaba.com",
        imageUrl: item.main_image ?? null,
      };
    });
}

export async function searchAlibaba(query: string): Promise<AlibabaSupplier[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN not set");

  const url = `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}&timeout=60&memory=256`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries: [query], maxItems: 5 }),
    signal: AbortSignal.timeout(65_000),
  });

  if (!res.ok) {
    throw new Error(`Apify error: ${res.status} ${await res.text()}`);
  }

  const items: ApifyRawItem[] = await res.json();
  return normalizeApifyItems(items);
}
