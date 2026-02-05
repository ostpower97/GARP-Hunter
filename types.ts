
export interface StockData {
  symbol: string;
  shortName: string;
  currentPrice: number;
  currency: string;
  // GARP Indicators
  pegRatio: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  earningsGrowth: number | null;
  returnOnEquity: number | null;
  // Additional Info
  marketCap: number | null;
  sector: string;
  industry: string;
  dividendYield: number | null;
  netProfitMargin: number | null;
  debtEquityRatio: number | null;
}

export interface IndexDefinition {
  id: string;
  name: string;
  tickers: string[];
}

export interface FilterSettings {
  maxPeg: number;
  maxPe: number;
  minGrowth: number;
  minRoe: number;
}
