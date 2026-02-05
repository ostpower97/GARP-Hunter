
import { StockData } from '../types';

export const fetchStockBatch = async (
  tickers: string[],
  log: (msg: string) => void
): Promise<StockData[]> => {
  try {
    const tickerString = tickers.join(',');
    // Der Call geht an unseren eigenen Server-Proxy, der jetzt 'yahoo-finance2' nutzt
    const response = await fetch(`/api/proxy?tickers=${tickerString}`);

    if (response.status === 504) {
       throw new Error("Gateway Timeout - Vercel hat die Verbindung gekappt (zu viele Ticker?)");
    }
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server Error ${response.status}: ${errText.substring(0, 50)}...`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
        return [];
    }

    return data;
  } catch (error: any) {
    log(`[API ERROR] ${error.message}`);
    return [];
  }
};
