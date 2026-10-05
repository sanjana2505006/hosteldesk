import { Category, Trade } from "@prisma/client";

export const TRADE_LABEL: Record<Trade, string> = {
  PLUMBER: "Plumber",
  ELECTRICIAN: "Electrician",
  CARPENTER: "Carpenter",
};

// Housekeeping and other can go to anyone. The rest need the matching trade.
const NEEDED: Partial<Record<Category, Trade>> = {
  PLUMBING: "PLUMBER",
  ELECTRICAL: "ELECTRICIAN",
  WIFI: "ELECTRICIAN",
  CARPENTRY: "CARPENTER",
  FURNITURE: "CARPENTER",
};

export function tradeNeeded(category: Category) {
  return NEEDED[category] ?? null;
}
