
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { tickers } = req.query;

  if (!tickers) {
    return res.status(400).json({ error: 'Tickers parameter is required' });
  }

  const symbols = tickers.split(',').filter(s => s.trim().length > 0);
  const results = [];

  // Yahoo Finance module config
  const modules = 'price,summaryDetail,defaultKeyStatistics,financialData';

  // Helper function to fetch data for a single symbol
  // Wir simulieren einen Browser User-Agent, um 429 Errors zu vermeiden
  const fetchSymbolData = async (symbol) => {
    try {
      const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${symbol}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const quoteSummary = data.quoteSummary?.result?.[0];

      if (!quoteSummary) return null;

      const price = quoteSummary.price || {};
      const summary = quoteSummary.summaryDetail || {};
      const stats = quoteSummary.defaultKeyStatistics || {};
      const financials = quoteSummary.financialData || {};

      return {
        symbol: symbol,
        shortName: price.shortName || price.longName || symbol,
        currency: price.currency || 'USD',
        currentPrice: price.regularMarketPrice?.raw || 0,
        
        pegRatio: stats.pegRatio?.raw || null,
        trailingPE: summary.trailingPE?.raw || null,
        forwardPE: summary.forwardPE?.raw || null,
        earningsGrowth: financials.earningsGrowth?.raw || null,
        returnOnEquity: financials.returnOnEquity?.raw || null,
        
        marketCap: summary.marketCap?.raw || null,
        sector: summary.sector || 'Unknown',
        industry: summary.industry || 'Unknown',
        dividendYield: summary.dividendYield?.raw || null,
        netProfitMargin: financials.profitMargins?.raw || null,
        debtEquityRatio: financials.debtToEquity?.raw ? financials.debtToEquity.raw / 100 : null, // Yahoo liefert oft als Prozentwert (z.B. 150), wir wollen Ratio (1.5)
      };

    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      return null;
    }
  };

  // Parallel fetch (limitiert auf Vercel execution time)
  // Wir führen die Promises parallel aus
  const promises = symbols.map(s => fetchSymbolData(s));
  const fetchedData = await Promise.all(promises);

  // Filter nulls
  const validData = fetchedData.filter(d => d !== null);

  return res.status(200).json(validData);
}
