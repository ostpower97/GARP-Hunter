export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  // Liste verschiedener Browser-Kennungen, um Blockierung zu erschweren
  const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  ];

  try {
    const decodedUrl = decodeURIComponent(url);
    const randomAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': randomAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      // Wir werfen den Fehler mit Status, damit der Client entscheiden kann (z.B. Fallback)
      throw new Error(`Upstream API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Setze CORS Header für die Client-App
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    // Cache für 60 Sekunden, um API-Limits zu schonen
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    // Wir geben 500 zurück, damit der Client weiß, dass der Proxy gescheitert ist -> Trigger Fallback
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}