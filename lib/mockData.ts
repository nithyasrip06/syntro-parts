import type { Part, AlibabaSupplier } from "@/types/part";

const MOCK_DB: Record<string, Part[]> = {
  default: [
    {
      mpn: "LM358DR",
      manufacturer: "Texas Instruments",
      description: "Dual General-Purpose Op-Amp, 1MHz, ±16V, SOIC-8",
      distributor: "DigiKey",
      distributorSku: "296-1395-1-ND",
      distributorUrl: "https://www.digikey.com/en/products/detail/texas-instruments/LM358DR/371591",
      unitPrice: 0.167,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.167, currency: "USD" },
        { quantity: 10, unitPrice: 0.132, currency: "USD" },
        { quantity: 100, unitPrice: 0.089, currency: "USD" },
        { quantity: 1000, unitPrice: 0.062, currency: "USD" },
      ],
      stockQty: 42850,
      leadTimeDays: 0,
      datasheetUrl: "https://www.ti.com/lit/ds/symlink/lm358.pdf",
      category: "Integrated Circuits",
      source: "nexar",
    },
    {
      mpn: "LM358DR",
      manufacturer: "Texas Instruments",
      description: "Dual General-Purpose Op-Amp, 1MHz, ±16V, SOIC-8",
      distributor: "Mouser",
      distributorSku: "595-LM358DR",
      distributorUrl: "https://www.mouser.com/ProductDetail/595-LM358DR",
      unitPrice: 0.18,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.18, currency: "USD" },
        { quantity: 10, unitPrice: 0.141, currency: "USD" },
        { quantity: 100, unitPrice: 0.097, currency: "USD" },
        { quantity: 1000, unitPrice: 0.068, currency: "USD" },
      ],
      stockQty: 31200,
      leadTimeDays: 0,
      datasheetUrl: "https://www.ti.com/lit/ds/symlink/lm358.pdf",
      category: "Integrated Circuits",
      source: "nexar",
    },
    {
      mpn: "LM358ADR",
      manufacturer: "Texas Instruments",
      description: "Dual General-Purpose Op-Amp, Extended Temp, SOIC-8",
      distributor: "Arrow",
      distributorSku: "LM358ADR",
      distributorUrl: "https://www.arrow.com/en/products/lm358adr/texas-instruments",
      unitPrice: 0.234,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.234, currency: "USD" },
        { quantity: 25, unitPrice: 0.189, currency: "USD" },
        { quantity: 100, unitPrice: 0.142, currency: "USD" },
      ],
      stockQty: 8740,
      leadTimeDays: 3,
      datasheetUrl: "https://www.ti.com/lit/ds/symlink/lm358-n.pdf",
      category: "Integrated Circuits",
      source: "nexar",
    },
  ],
  screw: [
    {
      mpn: "91290A117",
      manufacturer: "McMaster-Carr",
      description: "M3 x 10mm Socket Head Cap Screw, 18-8 Stainless Steel, Pkg of 100",
      distributor: "McMaster-Carr",
      distributorSku: "91290A117",
      distributorUrl: "https://www.mcmaster.com/91290A117",
      unitPrice: 0.059,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.059, currency: "USD" },
        { quantity: 100, unitPrice: 0.051, currency: "USD" },
        { quantity: 500, unitPrice: 0.039, currency: "USD" },
      ],
      stockQty: 9999,
      leadTimeDays: 1,
      datasheetUrl: null,
      category: "Fasteners",
      source: "nexar",
    },
    {
      mpn: "91290A113",
      manufacturer: "McMaster-Carr",
      description: "M3 x 8mm Socket Head Cap Screw, 18-8 Stainless Steel",
      distributor: "McMaster-Carr",
      distributorSku: "91290A113",
      distributorUrl: "https://www.mcmaster.com/91290A113",
      unitPrice: 0.041,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.041, currency: "USD" },
        { quantity: 100, unitPrice: 0.034, currency: "USD" },
        { quantity: 500, unitPrice: 0.026, currency: "USD" },
      ],
      stockQty: 9999,
      leadTimeDays: 1,
      datasheetUrl: null,
      category: "Fasteners",
      source: "nexar",
    },
    {
      mpn: "H703-ND",
      manufacturer: "Pan Pacific",
      description: "M3 x 8mm Pan Head Phillips Screw, Stainless",
      distributor: "DigiKey",
      distributorSku: "H703-ND",
      distributorUrl: "https://www.digikey.com/en/products/detail/-/-/H703-ND",
      unitPrice: 0.063,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.063, currency: "USD" },
        { quantity: 50, unitPrice: 0.052, currency: "USD" },
        { quantity: 100, unitPrice: 0.044, currency: "USD" },
      ],
      stockQty: 5400,
      leadTimeDays: 2,
      datasheetUrl: null,
      category: "Fasteners",
      source: "nexar",
    },
  ],
  resistor: [
    {
      mpn: "RC0402FR-0710KL",
      manufacturer: "Yageo",
      description: "10kΩ ±1% 62.5mW Thick Film Resistor, 0402",
      distributor: "DigiKey",
      distributorSku: "311-10.0KHRCT-ND",
      distributorUrl: "https://www.digikey.com/en/products/detail/yageo/RC0402FR-0710KL/726880",
      unitPrice: 0.01,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.01, currency: "USD" },
        { quantity: 100, unitPrice: 0.00295, currency: "USD" },
        { quantity: 1000, unitPrice: 0.00161, currency: "USD" },
        { quantity: 5000, unitPrice: 0.00116, currency: "USD" },
      ],
      stockQty: 2100000,
      leadTimeDays: 0,
      datasheetUrl: "https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_12.pdf",
      category: "Resistors",
      source: "nexar",
    },
    {
      mpn: "RC0402FR-0710KL",
      manufacturer: "Yageo",
      description: "10kΩ ±1% 62.5mW Thick Film Resistor, 0402",
      distributor: "Mouser",
      distributorSku: "603-RC0402FR-0710KL",
      distributorUrl: "https://www.mouser.com/ProductDetail/603-RC0402FR-0710KL",
      unitPrice: 0.011,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.011, currency: "USD" },
        { quantity: 100, unitPrice: 0.00332, currency: "USD" },
        { quantity: 1000, unitPrice: 0.00183, currency: "USD" },
      ],
      stockQty: 4850000,
      leadTimeDays: 0,
      datasheetUrl: "https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_12.pdf",
      category: "Resistors",
      source: "nexar",
    },
  ],
  capacitor: [
    {
      mpn: "GRM188R71C104KA01D",
      manufacturer: "Murata",
      description: "100nF ±10% 16V X7R Ceramic Capacitor, 0603",
      distributor: "DigiKey",
      distributorSku: "490-1532-1-ND",
      distributorUrl: "https://www.digikey.com/en/products/detail/murata-electronics/GRM188R71C104KA01D/587771",
      unitPrice: 0.01,
      currency: "USD",
      priceBreaks: [
        { quantity: 1, unitPrice: 0.01, currency: "USD" },
        { quantity: 100, unitPrice: 0.00295, currency: "USD" },
        { quantity: 1000, unitPrice: 0.00177, currency: "USD" },
        { quantity: 5000, unitPrice: 0.00139, currency: "USD" },
      ],
      stockQty: 1200000,
      leadTimeDays: 0,
      datasheetUrl: "https://www.murata.com/en-us/api/pdfdownloadapi?cate=muRFQ&partno=GRM188R71C104KA01D",
      category: "Capacitors",
      source: "nexar",
    },
  ],
};

const ALIBABA_MOCK: Record<string, AlibabaSupplier[]> = {
  screw: [
    {
      supplierName: "Shenzhen FastFix Hardware Co., Ltd.",
      productTitle: "M3 Stainless Steel Socket Head Cap Screws DIN912",
      priceMin: 0.008,
      priceMax: 0.025,
      currency: "USD",
      moq: 1000,
      leadTimeMin: 15,
      leadTimeMax: 30,
      supplierRating: 4.8,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
    {
      supplierName: "Dongguan Precision Bolt Factory",
      productTitle: "M3x8 Phillips Pan Head Machine Screws 304 Stainless",
      priceMin: 0.005,
      priceMax: 0.018,
      currency: "USD",
      moq: 2000,
      leadTimeMin: 20,
      leadTimeMax: 35,
      supplierRating: 4.6,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
    {
      supplierName: "Ningbo Yinzhou Fastener Manufacturer",
      productTitle: "Custom M3 Hex Bolts Screws Nuts Set Carbon Steel Zinc",
      priceMin: 0.004,
      priceMax: 0.012,
      currency: "USD",
      moq: 5000,
      leadTimeMin: 25,
      leadTimeMax: 45,
      supplierRating: 4.5,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
  ],
  default: [
    {
      supplierName: "Shenzhen IC Components Co., Ltd.",
      productTitle: "LM358 Dual Op-Amp IC Original New Stock SOIC-8",
      priceMin: 0.04,
      priceMax: 0.09,
      currency: "USD",
      moq: 500,
      leadTimeMin: 10,
      leadTimeMax: 20,
      supplierRating: 4.7,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
    {
      supplierName: "Guangzhou Electronic Parts Trading",
      productTitle: "LM358DR SOP8 Operational Amplifier Chip",
      priceMin: 0.035,
      priceMax: 0.08,
      currency: "USD",
      moq: 1000,
      leadTimeMin: 15,
      leadTimeMax: 25,
      supplierRating: 4.5,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
    {
      supplierName: "Shenzhen Kingstronics Electronic",
      productTitle: "LM358 Op-Amp IC Chip Low Power Dual Operational Amplifiers",
      priceMin: 0.03,
      priceMax: 0.07,
      currency: "USD",
      moq: 2000,
      leadTimeMin: 20,
      leadTimeMax: 30,
      supplierRating: 4.4,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
  ],
  resistor: [
    {
      supplierName: "Guangdong Yageo Passives Distributor",
      productTitle: "0402 10K Ohm 1% SMD Resistor RC0402FR-0710KL Reel 10000pcs",
      priceMin: 0.001,
      priceMax: 0.003,
      currency: "USD",
      moq: 10000,
      leadTimeMin: 10,
      leadTimeMax: 20,
      supplierRating: 4.9,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
    {
      supplierName: "Shenzhen Walsin Technology Dealer",
      productTitle: "10K Resistor 0402 SMD 1/16W 1% Tolerance Chip Resistor",
      priceMin: 0.0008,
      priceMax: 0.0025,
      currency: "USD",
      moq: 20000,
      leadTimeMin: 15,
      leadTimeMax: 25,
      supplierRating: 4.7,
      productUrl: "https://www.alibaba.com",
      imageUrl: null,
    },
  ],
};

export function getMockAlibabaResults(query: string): AlibabaSupplier[] {
  const q = query.toLowerCase();
  if (q.includes("screw") || /\bm[2-6]\b/.test(q) || q.includes("fastener")) {
    return ALIBABA_MOCK.screw;
  }
  if (q.includes("resistor") || q.includes("10k") || q.includes("ohm")) {
    return ALIBABA_MOCK.resistor;
  }
  return ALIBABA_MOCK.default;
}

export function getMockResults(query: string): Part[] {
  const q = query.toLowerCase();
  if (q.includes("screw") || /\bm[2-6]\b/.test(q) || q.includes("fastener") || q.includes("bolt")) {
    return MOCK_DB.screw;
  }
  if (q.includes("resistor") || q.includes("10k") || q.includes("ohm")) {
    return MOCK_DB.resistor;
  }
  if (q.includes("capacitor") || q.includes("cap") || q.includes("100nf") || q.includes("0603")) {
    return MOCK_DB.capacitor;
  }
  if (q.includes("lm358") || q.includes("op amp") || q.includes("opamp")) {
    return MOCK_DB.default;
  }
  return MOCK_DB.default;
}
