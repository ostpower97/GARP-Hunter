export interface StockData {
  symbol: string;
  shortName: string;
  currentPrice: number;
  currency: string;
  // GARP Indicators
  pegRatio: number | null;      // Price/Earnings to Growth
  trailingPE: number | null;    // P/E Ratio
  forwardPE: number | null;     // Forward P/E
  earningsGrowth: number | null; // Quarterly Earnings Growth (yoy)
  returnOnEquity: number | null; // ROE
  marketCap: number | null;
  sector: string;
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

// Helper types for Yahoo API response structure (which is nested/complex)
export interface YahooField {
  raw?: number;
  fmt?: string;
  longFmt?: string;
}

export interface YahooQuoteSummary {
  quoteSummary: {
    result: Array<{
      defaultKeyStatistics?: {
        pegRatio?: YahooField;
        forwardPE?: YahooField;
        earningsQuarterlyGrowth?: YahooField; // Growth
      };
      financialData?: {
        currentPrice?: YahooField;
        returnOnEquity?: YahooField;
        grossMargins?: YahooField;
        currency?: string;
      };
      price?: {
        shortName?: string;
        symbol?: string;
        marketCap?: YahooField;
        regularMarketPrice?: YahooField;
      };
      summaryProfile?: {
        sector?: string;
      };
    }>;
    error: any;
  };
}