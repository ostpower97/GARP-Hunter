
export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  // query2 ist oft stabiler und weniger restriktiv als query1
  const modules = 'defaultKeyStatistics,financialData,assetProfile,price';
  const targetUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://finance.yahoo.com/'
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Yahoo API error: ${response.statusText}`,
        details: text.slice(0, 100) 
      });
    }

    try {
      const data = JSON.parse(text);
      if (data.quoteSummary?.error) {
        return res.status(404).json({ error: data.quoteSummary.error.description });
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json(data.quoteSummary.result[0]);
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Malformed JSON from Yahoo', 
        raw: text.slice(0, 100) 
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
