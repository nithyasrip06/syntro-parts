export interface PriceBreak {
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface AlibabaSupplier {
  supplierName: string;
  productTitle: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  moq: number;
  leadTimeMin: number;
  leadTimeMax: number;
  supplierRating: number | null;
  productUrl: string;
  imageUrl: string | null;
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
