import type { AlibabaSupplier } from "@/types/part";

// Actor: bebity/alibaba-product-scraper (apify.com/store)
// Swap actorId here if you find a better maintained alternative
const ACTOR_ID = "bebity~alibaba-product-scraper";
const APIFY_BASE = "https://api.apify.com/v2";

interface ApifyRawItem {
  companyName?: string;
  title?: string;
  productName?: string;
  price?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  minOrder?: number | string;
  moq?: number | string;
  url?: string;
  productUrl?: string;
  imageUrl?: string;
  image?: string;
  rating?: number;
  supplierRating?: number;
  leadTime?: string;
}

function parsePriceRange(raw: ApifyRawItem): { min: number; max: number; currency: string } {
  // Try structured fields first
  if (raw.minPrice && raw.maxPrice) {
    return { min: raw.minPrice, max: raw.maxPrice, currency: "USD" };
  }
  // Parse string like "$0.05 - $0.12" or "¥0.30-¥0.80"
  const str = raw.price ?? raw.priceRange ?? "";
  const nums = str.match(/[\d.]+/g)?.map(Number).filter((n) => n > 0) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1], currency: "USD" };
  if (nums.length === 1) return { min: nums[0], max: nums[0], currency: "USD" };
  return { min: 0, max: 0, currency: "USD" };
}

function parseLeadTime(raw: ApifyRawItem): { min: number; max: number } {
  const str = raw.leadTime ?? "";
  const nums = str.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: 15, max: 45 }; // Alibaba default estimate
}

function normalizeMoq(raw: ApifyRawItem): number {
  const val = raw.minOrder ?? raw.moq ?? 1;
  return typeof val === "string" ? parseInt(val.replace(/\D/g, "")) || 1 : val;
}

export function normalizeApifyItems(items: ApifyRawItem[]): AlibabaSupplier[] {
  return items
    .filter((item) => item.companyName || item.title || item.productName)
    .slice(0, 5)
    .map((item) => {
      const price = parsePriceRange(item);
      const lead = parseLeadTime(item);
      return {
        supplierName: item.companyName ?? "Unknown Supplier",
        productTitle: item.title ?? item.productName ?? "Product",
        priceMin: price.min,
        priceMax: price.max,
        currency: price.currency,
        moq: normalizeMoq(item),
        leadTimeMin: lead.min,
        leadTimeMax: lead.max,
        supplierRating: item.rating ?? item.supplierRating ?? null,
        productUrl: item.url ?? item.productUrl ?? "https://www.alibaba.com",
        imageUrl: item.imageUrl ?? item.image ?? null,
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
    body: JSON.stringify({
      searchQuery: query,
      maxItems: 5,
      // some actors use these field names instead:
      keyword: query,
      maxProducts: 5,
    }),
    signal: AbortSignal.timeout(65_000),
  });

  if (!res.ok) {
    throw new Error(`Apify error: ${res.status} ${await res.text()}`);
  }

  const items: ApifyRawItem[] = await res.json();
  return normalizeApifyItems(items);
}
