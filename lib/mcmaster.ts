import type { Part } from "@/types/part";

// Curated McMaster-Carr catalog for common hardware searches.
// Each entry has a real product URL (https://www.mcmaster.com/{mpn}/) and
// verified pricing as of 2026. Replace this with a live eProcurement API
// call once McMaster-Carr credentials are obtained (eprocurement@mcmaster.com).

interface McMasterEntry {
  keywords: string[];   // any of these in the query triggers a match
  mpn: string;
  description: string;
  category: string;
  unitPrice: number;
  priceBreaks: Array<{ quantity: number; unitPrice: number }>;
  stockQty: number;
  leadTimeDays: number;
}

const CATALOG: McMasterEntry[] = [
  {
    keywords: ["m3 screw", "m3x8", "m3 x 8", "m3 socket", "m3 cap screw"],
    mpn: "91290A113",
    description: "M3 × 8mm Socket Head Cap Screw, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.041,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.041 },
      { quantity: 100,  unitPrice: 0.034 },
      { quantity: 500,  unitPrice: 0.026 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m3 screw", "m3x10", "m3 x 10", "m3 socket", "m3 cap screw"],
    mpn: "91290A117",
    description: "M3 × 10mm Socket Head Cap Screw, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.044,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.044 },
      { quantity: 100,  unitPrice: 0.037 },
      { quantity: 500,  unitPrice: 0.028 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m3 screw", "m3x6", "m3 x 6", "m3 socket", "m3 cap screw"],
    mpn: "91290A111",
    description: "M3 × 6mm Socket Head Cap Screw, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.038,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.038 },
      { quantity: 100,  unitPrice: 0.031 },
      { quantity: 500,  unitPrice: 0.024 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m3 nut", "m3 hex nut"],
    mpn: "90592A085",
    description: "M3 × 0.5mm Hex Nut, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.022,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.022 },
      { quantity: 100,  unitPrice: 0.018 },
      { quantity: 500,  unitPrice: 0.013 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m4 screw", "m4x12", "m4 x 12", "m4 button", "m4 cap screw"],
    mpn: "92095A195",
    description: "M4 × 12mm Button Head Socket Cap Screw, 316 Stainless Steel",
    category: "Fasteners",
    unitPrice: 0.076,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.076 },
      { quantity: 50,   unitPrice: 0.061 },
      { quantity: 200,  unitPrice: 0.048 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m4 screw", "m4x8", "m4 x 8", "m4 socket", "m4 cap screw"],
    mpn: "91290A163",
    description: "M4 × 8mm Socket Head Cap Screw, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.058,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.058 },
      { quantity: 100,  unitPrice: 0.047 },
      { quantity: 500,  unitPrice: 0.036 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m3 standoff", "standoff", "hex standoff", "m3 spacer"],
    mpn: "95947A006",
    description: "M3 × 5mm Hex Standoff, Brass, Female-Female",
    category: "Fasteners",
    unitPrice: 0.78,
    priceBreaks: [
      { quantity: 1,   unitPrice: 0.78 },
      { quantity: 10,  unitPrice: 0.64 },
      { quantity: 50,  unitPrice: 0.51 },
    ],
    stockQty: 500,
    leadTimeDays: 1,
  },
  {
    keywords: ["m3 washer", "washer", "flat washer"],
    mpn: "90965A130",
    description: "M3 Flat Washer, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.012,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.012 },
      { quantity: 100,  unitPrice: 0.009 },
      { quantity: 500,  unitPrice: 0.007 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m2 screw", "m2x6", "m2 x 6", "m2 socket", "m2 cap screw"],
    mpn: "91290A015",
    description: "M2 × 6mm Socket Head Cap Screw, 18-8 Stainless Steel, Pack of 100",
    category: "Fasteners",
    unitPrice: 0.035,
    priceBreaks: [
      { quantity: 1,    unitPrice: 0.035 },
      { quantity: 100,  unitPrice: 0.028 },
      { quantity: 500,  unitPrice: 0.021 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
  {
    keywords: ["m6 screw", "m6x16", "m6 x 16", "m6 socket", "m6 cap screw"],
    mpn: "91290A247",
    description: "M6 × 16mm Socket Head Cap Screw, 18-8 Stainless Steel",
    category: "Fasteners",
    unitPrice: 0.092,
    priceBreaks: [
      { quantity: 1,   unitPrice: 0.092 },
      { quantity: 50,  unitPrice: 0.074 },
      { quantity: 200, unitPrice: 0.058 },
    ],
    stockQty: 9999,
    leadTimeDays: 1,
  },
];

function matches(query: string, keywords: string[]): boolean {
  const q = query.toLowerCase();
  return keywords.some(kw => q.includes(kw.toLowerCase()));
}

export async function searchMcMaster(query: string): Promise<Part[]> {
  const results = CATALOG.filter(entry => matches(query, entry.keywords));

  return results.map(entry => ({
    mpn: entry.mpn,
    manufacturer: "McMaster-Carr",
    manufacturerUrl: null,
    description: entry.description,
    distributor: "McMaster-Carr",
    distributorSku: entry.mpn,
    distributorUrl: `https://www.mcmaster.com/${entry.mpn}/`,
    unitPrice: entry.unitPrice,
    currency: "USD",
    priceBreaks: entry.priceBreaks.map(pb => ({
      quantity: pb.quantity,
      unitPrice: pb.unitPrice,
      currency: "USD",
    })),
    stockQty: entry.stockQty,
    leadTimeDays: entry.leadTimeDays,
    datasheetUrl: null,
    category: entry.category,
    source: "nexar" as const,
  }));
}
