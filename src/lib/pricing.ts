// Pricing constants (in paise)
export const PAGE_PRICE_BW = 500; // ₹5 per BW page (500 paise)
export const PAGE_PRICE_COLOR = 1000; // ₹10 per color page (1000 paise)

// Cost breakdown type
export type CostBreakdown = {
  documentCost: number; // pages * copies * pagePrice
  packDiscount: number; // pages covered by pack * pagePrice (negative = saving)
  extraCharge: number;  // chargeable pages * pagePrice
  addonCost: number;    // ONE-TIME flat fee — never multiplied by copies
  grandTotal: number;   // total to pay in paise
};

export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  if (paise === 0) return "FREE";
  return `₹${rupees.toFixed(2)}`;
}

export function calculateOrderCost(params: {
  pages: number;
  copies: number;
  printMode: "BW" | "COLOR";
  addonPrices: Array<{ price: number }>;
  remainingPackPages: number;
  packType: "BW_ONLY" | "BW_AND_COLOR" | null;
  isTrialEligible: boolean;
  trialMaxPages: number;
}): {
  breakdown: CostBreakdown;
  chargeablePages: number;
  coveredByPack: number;
  isTrialUsed: boolean;
  printablePages: number;
} {
  const printablePages = params.pages * params.copies;
  const pagePrice = params.printMode === "COLOR" ? PAGE_PRICE_COLOR : PAGE_PRICE_BW;
  const documentCost = printablePages * pagePrice;
  
  let isTrialUsed = false;
  if (
    params.isTrialEligible &&
    params.printMode === "BW" &&
    params.addonPrices.length === 0 &&
    printablePages <= params.trialMaxPages
  ) {
    isTrialUsed = true;
    return {
      breakdown: {
        documentCost: 0,
        packDiscount: 0,
        extraCharge: 0,
        addonCost: 0,
        grandTotal: 0,
      },
      chargeablePages: 0,
      coveredByPack: printablePages,
      isTrialUsed: true,
      printablePages,
    };
  }

  let coveredByPack = 0;
  let chargeablePages = printablePages;
  let packDiscount = 0;

  if (params.remainingPackPages > 0 && params.packType) {
    if (params.packType === "BW_ONLY" && params.printMode === "BW") {
      // BW pack + BW print: deduct pages
      coveredByPack = Math.min(params.remainingPackPages, printablePages);
      chargeablePages = printablePages - coveredByPack;
      packDiscount = coveredByPack * pagePrice;
    } else if (params.packType === "BW_AND_COLOR") {
      // BW+Color pack: covers both
      coveredByPack = Math.min(params.remainingPackPages, printablePages);
      chargeablePages = printablePages - coveredByPack;
      packDiscount = coveredByPack * pagePrice;
    }
    // BW pack + Color print: no page deduction, full charge
  }

  const extraCharge = chargeablePages * pagePrice;
  const addonCost = params.addonPrices.reduce((sum, a) => sum + a.price, 0);
  const grandTotal = extraCharge + addonCost;

  return {
    breakdown: {
      documentCost,
      packDiscount: -packDiscount,
      extraCharge,
      addonCost,
      grandTotal,
    },
    chargeablePages,
    coveredByPack,
    isTrialUsed,
    printablePages,
  };
}
