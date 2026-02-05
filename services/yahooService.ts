
import { StockData } from '../types';

export const fetchStockBatch = async (
  tickers: string[],
  log: (msg: string) => void
): Promise<StockData[]> => {
  try {
    const tickerString = tickers.join(',');
    // Aufruf des eigenen Vercel-Proxies
    const response = await fetch(`/api/proxy?tickers=${tickerString}`);

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
        return [];
    }

    return data;
  } catch (error: any) {
    log(`[PROXY ERROR] ${error.message}`);
    return [];
  }
};
