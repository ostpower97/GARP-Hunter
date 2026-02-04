import { StockData, YahooQuoteSummary } from '../types';

// Utility to safely extract raw numbers from Yahoo's { raw: 123, fmt: "123" } structure
const getRaw = (field: any): number | null => {
  if (field && typeof field === 'object' && 'raw' in field) {
    return field.raw;
  }
  if (typeof field === 'number') return field;
  return null;
};

// Configuration
const PROXY_LOCAL = '/api/proxy';
const PROXY_FALLBACK = 'https://corsproxy.io/?'; 

export const fetchStockDetails = async (
  symbol: string, 
  log: (msg: string) => void
): Promise<StockData | null> => {
  
  const modules = 'defaultKeyStatistics,financialData,price,summaryProfile';
  const targetUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`;
  const encodedUrl = encodeURIComponent(targetUrl);

  // Strategie-Liste: Erst Lokal versuchen, bei Fehler (500/403/etc) auf Public Proxy ausweichen
  const strategies = [
    { name: 'Local', url: `${PROXY_LOCAL}?url=${encodedUrl}` },
    { name: 'Fallback', url: `${PROXY_FALLBACK}${encodedUrl}` }
  ];

  for (const strategy of strategies) {
    try {
      const response = await fetch(strategy.url);
      
      // Wenn der Status nicht OK ist (z.B. 500 vom Vercel Proxy), nächste Strategie versuchen
      if (!response.ok) {
         log(`[WARN] ${symbol}: ${strategy.name} Proxy failed (HTTP ${response.status}). Trying next...`);
         continue; 
      }
      
      const data: YahooQuoteSummary = await response.json();

      // Yahoo API Fehlerprüfung
      if (data.quoteSummary?.error) {
         log(`[WARN] ${symbol}: ${strategy.name} API Error: ${JSON.stringify(data.quoteSummary.error)}`);
         continue;
      }

      const result = data.quoteSummary?.result?.[0];

      if (!result) {
         log(`[WARN] ${symbol}: ${strategy.name} returned empty result. Trying next...`);
         continue;
      }

      // Wenn wir hier sind, haben wir Daten!
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

      // Optional: Erfolg loggen (kommentiert um Spam zu vermeiden)
      // log(`[OK] ${symbol} via ${strategy.name}`);

      return stockData;

    } catch (error: any) {
       // Netzwerkfehler (z.B. CORS blockiert, Internet weg)
       log(`[WARN] ${symbol}: ${strategy.name} Network Error: ${error.message}`);
       continue;
    }
  }

  // Wenn alle Strategien fehlgeschlagen sind
  log(`[ERROR] ${symbol}: All fetch strategies failed.`);
  return null;
};