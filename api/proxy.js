
const yahooFinance = require('yahoo-finance2').default;

export default async function handler(req, res) {
  // CORS Headers erlauben
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
  
  // Konfiguration von yahoo-finance2 unterdrücken von Warnings
  yahooFinance.suppressNotices(['yahooSurvey']);

  const results = [];

  // Helper Funktion für einzelne Abfrage
  const fetchSymbolData = async (symbol) => {
    try {
      // Wir holen quoteSummary mit den Modulen, die wir brauchen
      // Das Äquivalent zu yfinance Ticker.info
      const result = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData']
      });

      if (!result) return null;

      const price = result.price || {};
      const summary = result.summaryDetail || {};
      const stats = result.defaultKeyStatistics || {};
      const financials = result.financialData || {};

      return {
        symbol: symbol,
        shortName: price.shortName || price.longName || symbol,
        currency: price.currency || 'USD',
        currentPrice: price.regularMarketPrice || 0,
        
        // Wichtig: yahoo-finance2 liefert saubere Zahlen, kein .raw mehr nötig
        pegRatio: stats.pegRatio || null,
        trailingPE: summary.trailingPE || null,
        forwardPE: summary.forwardPE || null,
        earningsGrowth: financials.earningsGrowth || null,
        returnOnEquity: financials.returnOnEquity || null,
        
        marketCap: summary.marketCap || null,
        sector: summary.sector || 'Unknown',
        industry: summary.industry || 'Unknown',
        dividendYield: summary.dividendYield || null,
        netProfitMargin: financials.profitMargins || null,
        // Manchmal liefert Yahoo DebtToEquity als %, manchmal als Ratio. Wir normalisieren grob.
        debtEquityRatio: financials.debtToEquity ? financials.debtToEquity / 100 : null,
      };

    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error.message);
      return null;
    }
  };

  // Parallel abarbeiten
  // Hinweis: Bei zu vielen parallelen Requests kann auch hier ein 429 kommen.
  // In einer echten Prod-Umgebung würde man hier throttlen (p-limit).
  // Für Vercel Serverless ist Promise.all meist okay für kleine Batches (5-10).
  const promises = symbols.map(s => fetchSymbolData(s));
  const fetchedData = await Promise.all(promises);
  
  const validData = fetchedData.filter(d => d !== null);

  return res.status(200).json(validData);
}
