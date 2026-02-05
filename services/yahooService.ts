
import { StockData } from '../types';

const PROXY_URL = '/api/proxy';

export const fetchStockDetails = async (
  symbol: string, 
  _unusedKey: string,
  log: (msg: string) => void
): Promise<StockData | null> => {
  
  try {
    const response = await fetch(`${PROXY_URL}?symbol=${symbol}`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const err = await response.json();
        log(`[FAIL] ${symbol}: ${err.error || response.statusText}`);
      } else {
        const text = await response.text();
        log(`[FAIL] ${symbol}: HTTP ${response.status} - ${text.slice(0, 50)}`);
      }
      return null;
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      log(`[ERROR] ${symbol}: Ungültiges Datenformat vom Proxy.`);
      return null;
    }
    
    const stats = data.defaultKeyStatistics || {};
    const financial = data.financialData || {};
    const price = data.price || {};
    const profile = data.assetProfile || {};

    const getValue = (obj: any) => {
      if (!obj) return null;
      if (typeof obj === 'object') return obj.raw !== undefined ? obj.raw : null;
      return obj;
    };

    return {
      symbol: symbol,
      shortName: price.shortName || symbol,
      currentPrice: getValue(financial.currentPrice) || getValue(price.regularMarketPrice) || 0,
      currency: price.currency || 'USD',
      pegRatio: getValue(stats.pegRatio),
      trailingPE: getValue(stats.trailingPE) || getValue(financial.trailingPE),
      forwardPE: getValue(stats.forwardPE),
      earningsGrowth: getValue(financial.earningsGrowth),
      returnOnEquity: getValue(financial.returnOnEquity),
      marketCap: getValue(price.marketCap),
      sector: profile.sector || 'N/A',
      industry: profile.industry || 'N/A',
      dividendYield: getValue(stats.dividendYield) || getValue(financial.dividendYield),
      netProfitMargin: getValue(financial.profitMargins),
      debtEquityRatio: getValue(financial.debtToEquity) ? getValue(financial.debtToEquity) / 100 : null
    };

  } catch (error: any) {
    log(`[FATAL] ${symbol}: ${error.message}`);
    return null;
  }
};
