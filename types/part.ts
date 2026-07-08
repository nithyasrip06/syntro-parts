export interface PriceBreak {
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface Part {
  mpn: string;
  manufacturer: string;
  description: string;
  distributor: string;
  distributorSku: string;
  distributorUrl: string | null;
  unitPrice: number | null;
  currency: string;
  priceBreaks: PriceBreak[];
  stockQty: number;
  leadTimeDays: number | null;
  datasheetUrl: string | null;
  category: string | null;
  source: "nexar";
}
