import { StockData, YahooQuoteSummary } from '../types';

// Utility to safely extract raw numbers from Yahoo's { raw: 123, fmt: "123" } structure
const getRaw = (field: any): number | null => {
  if (field && typeof field === 'object' && 'raw' in field) {
    return field.raw;
  }
  if (typeof field === 'number') return field;
  return null;
};

// Only use local proxy as requested
const PROXY_URL = '/api/proxy';

export const fetchStockDetails = async (
  symbol: string, 
  log: (msg: string) => void
): Promise<StockData | null> => {
  
  // Load Balancing zwischen query1 und query2
  const host = Math.random() > 0.5 ? 'query1.finance.yahoo.com' : 'query2.finance.yahoo.com';
  const modules = 'defaultKeyStatistics,financialData,price,summaryProfile';
  const targetUrl = `https://${host}/v10/finance/quoteSummary/${symbol}?modules=${modules}`;
  
  const fetchUrl = `${PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
        // Versuche, Details aus dem JSON-Body zu lesen, falls der Proxy welche sendet
        let errorDetail = response.statusText;
        try {
            const errJson = await response.json();
            if (errJson.details) errorDetail = errJson.details;
        } catch (e) { /* ignore json parse error */ }

        log(`[ERROR] ${symbol}: HTTP ${response.status} - ${errorDetail}`);
        return null;
    }
    
    const data: YahooQuoteSummary = await response.json();

    if (data.quoteSummary?.error) {
        log(`[API-ERR] ${symbol}: ${JSON.stringify(data.quoteSummary.error)}`);
        return null;
    }

    const result = data.quoteSummary?.result?.[0];

    if (!result) {
        log(`[EMPTY] ${symbol}: No data received.`);
        return null;
    }

    const stats = result.defaultKeyStatistics;
    const fin = result.financialData;
    const price = result.price;
    const profile = result.summaryProfile;

    const stockData: StockData = {
      symbol: symbol,
      shortName: price?.shortName || symbol,
      currentPrice: getRaw(fin?.currentPrice) || getRaw(price?.regularMarketPrice) || 0,
      currency: fin?.currency || 'USD',
      pegRatio: getRaw(stats?.pegRatio),
      trailingPE: getRaw(stats?.forwardPE), 
      forwardPE: getRaw(stats?.forwardPE),
      earningsGrowth: getRaw(stats?.earningsQuarterlyGrowth), 
      returnOnEquity: getRaw(fin?.returnOnEquity),
      marketCap: getRaw(price?.marketCap),
      sector: profile?.sector || 'Unknown'
    };

    return stockData;

  } catch (error: any) {
    log(`[EXCEPTION] ${symbol}: ${error.message || error}`);
    return null;
  }
};