import { StockData, YahooQuoteSummary } from '../types';

// Utility to safely extract raw numbers from Yahoo's { raw: 123, fmt: "123" } structure
const getRaw = (field: any): number | null => {
  if (field && typeof field === 'object' && 'raw' in field) {
    return field.raw;
  }
  if (typeof field === 'number') return field;
  return null;
};

// Vercel Proxy URL
const PROXY_BASE = '/api/proxy';

export const fetchStockDetails = async (symbol: string): Promise<StockData | null> => {
  // Yahoo Modules für GARP:
  // defaultKeyStatistics -> PEG, Forward PE
  // financialData -> Current Price, ROE, Margins
  // earnings -> Growth info (manchmal unzuverlässig, daher defaultKeyStatistics.earningsQuarterlyGrowth nutzen)
  const modules = 'defaultKeyStatistics,financialData,price,summaryProfile';
  const targetUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`;
  
  const proxyUrl = `${PROXY_BASE}?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Network error');
    
    const data: YahooQuoteSummary = await response.json();
    const result = data.quoteSummary?.result?.[0];

    if (!result) return null;

    const stats = result.defaultKeyStatistics;
    const fin = result.financialData;
    const price = result.price;
    const profile = result.summaryProfile;

    return {
      symbol: symbol,
      shortName: price?.shortName || symbol,
      currentPrice: getRaw(fin?.currentPrice) || getRaw(price?.regularMarketPrice) || 0,
      currency: fin?.currency || 'USD',
      
      // Indikatoren
      pegRatio: getRaw(stats?.pegRatio),
      trailingPE: getRaw(stats?.forwardPE), // Fallback logic handled in UI usually, but Yahoo labels are weird.
      forwardPE: getRaw(stats?.forwardPE),
      earningsGrowth: getRaw(stats?.earningsQuarterlyGrowth), // Quarterly Growth yoy
      returnOnEquity: getRaw(fin?.returnOnEquity),
      marketCap: getRaw(price?.marketCap),
      sector: profile?.sector || 'Unknown'
    };
  } catch (error) {
    console.warn(`Error fetching ${symbol}:`, error);
    return null;
  }
};