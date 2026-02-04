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
// Fallback Proxy für lokale Entwicklung ohne Vercel Server
const PROXY_FALLBACK = 'https://corsproxy.io/?'; 

export const fetchStockDetails = async (
  symbol: string, 
  log: (msg: string) => void
): Promise<StockData | null> => {
  
  const modules = 'defaultKeyStatistics,financialData,price,summaryProfile';
  const targetUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`;
  
  // Standardmäßig versuchen wir den lokalen Proxy
  let fetchUrl = `${PROXY_LOCAL}?url=${encodeURIComponent(targetUrl)}`;
  let isFallback = false;

  try {
    let response = await fetch(fetchUrl);
    
    // Check: Wenn der lokale Proxy nicht existiert (404 File not found), schalte auf Fallback um.
    // Ein "echter" 404 von Yahoo würde durch den Proxy als 500er Fehler oder JSON-Fehler kommen.
    // Ein 404 auf der Root-Ebene des Fetchs bedeutet meistens: Route fehlt.
    if (response.status === 404) {
        log(`[WARN] ${symbol}: Local API Route (/api/proxy) missing. Switching to public fallback.`);
        isFallback = true;
        fetchUrl = `${PROXY_FALLBACK}${encodeURIComponent(targetUrl)}`;
        response = await fetch(fetchUrl);
    }

    if (!response.ok) {
        log(`[ERROR] ${symbol}: HTTP ${response.status} ${response.statusText} ${isFallback ? '(Public Proxy)' : '(Local Proxy)'}`);
        return null;
    }
    
    const data: YahooQuoteSummary = await response.json();

    if (data.quoteSummary?.error) {
        log(`[API-ERR] ${symbol}: ${JSON.stringify(data.quoteSummary.error)}`);
        return null;
    }

    const result = data.quoteSummary?.result?.[0];

    if (!result) {
        // Manchmal liefert Yahoo leere Ergebnisse bei Überlastung oder exotischen Ticker-Symbolen
        log(`[EMPTY] ${symbol}: No 'result' in payload.`);
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

    // Log success only for debug if needed, otherwise it spams
    // log(`[OK] ${symbol} loaded.`);

    return stockData;

  } catch (error: any) {
    // Falls der Fetch komplett fehlschlägt (z.B. Netzwerk blockiert)
    if (!isFallback && (error.message.includes('Failed to fetch') || error.name === 'TypeError')) {
         log(`[WARN] ${symbol}: Local fetch failed completely. Retrying fallback...`);
         try {
            const fallbackUrl = `${PROXY_FALLBACK}${encodeURIComponent(targetUrl)}`;
            const res2 = await fetch(fallbackUrl);
            if(res2.ok) {
                const data2 = await res2.json();
                const res = data2.quoteSummary?.result?.[0];
                if(res) {
                     // Quick manual mapping for the fallback recovery path
                     const stats = res.defaultKeyStatistics;
                     const fin = res.financialData;
                     const price = res.price;
                     const profile = res.summaryProfile;
                     return {
                        symbol: symbol,
                        shortName: price?.shortName || symbol,
                        currentPrice: getRaw(fin?.currentPrice) || 0,
                        currency: fin?.currency || 'USD',
                        pegRatio: getRaw(stats?.pegRatio),
                        trailingPE: getRaw(stats?.forwardPE),
                        forwardPE: getRaw(stats?.forwardPE),
                        earningsGrowth: getRaw(stats?.earningsQuarterlyGrowth),
                        returnOnEquity: getRaw(fin?.returnOnEquity),
                        marketCap: getRaw(price?.marketCap),
                        sector: profile?.sector || 'Unknown'
                     };
                }
            }
         } catch(e) {
             // ignore secondary fail
         }
    }
    
    log(`[EXCEPTION] ${symbol}: ${error.message || error}`);
    return null;
  }
};