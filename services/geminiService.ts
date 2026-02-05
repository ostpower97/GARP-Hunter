
import { GoogleGenAI } from "@google/genai";
import { StockData } from "../types";

const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });

export interface GeminiResponse {
  stocks: StockData[];
  sources: { title: string; uri: string }[];
}

export const analyzeTickersWithAI = async (
  tickers: string[],
  log: (msg: string) => void
): Promise<GeminiResponse> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Conduct a deep financial research for these stocks: ${tickers.join(", ")}.
    Using Google Search, find the MOST RECENT data for:
    - Current Price and Currency
    - PEG Ratio (Forward 5y preferred)
    - Trailing P/E
    - Earnings Growth (YoY %)
    - Return on Equity (ROE %)
    - Net Profit Margin (%)
    - Debt to Equity Ratio
    - Market Cap
    - Industry and Sector
    - Dividend Yield
    
    Return the result as a JSON array. 
    Fields: symbol, shortName, currentPrice (number), currency, pegRatio (number), trailingPE (number), earningsGrowth (number), returnOnEquity (number), netProfitMargin (number), debtEquityRatio (number), dividendYield (number), industry, sector.
    
    IMPORTANT: Return ONLY the raw JSON array. No markdown, no conversational text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sources.push({ title: chunk.web.title || "Finanzquelle", uri: chunk.web.uri });
      }
    });

    let stocks: StockData[] = [];
    try {
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']') + 1;
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = text.substring(startIdx, endIdx);
        const parsed = JSON.parse(jsonStr);
        
        // Validierung und Sanierung der Daten
        // Hier stellen wir sicher, dass currentPrice niemals undefined ist
        stocks = parsed.map((item: any) => ({
          symbol: item.symbol || '?',
          shortName: item.shortName || item.symbol || 'Unknown',
          currentPrice: typeof item.currentPrice === 'number' ? item.currentPrice : 0,
          currency: item.currency || 'USD',
          
          pegRatio: typeof item.pegRatio === 'number' ? item.pegRatio : null,
          trailingPE: typeof item.trailingPE === 'number' ? item.trailingPE : null,
          forwardPE: typeof item.forwardPE === 'number' ? item.forwardPE : null,
          earningsGrowth: typeof item.earningsGrowth === 'number' ? item.earningsGrowth : null,
          returnOnEquity: typeof item.returnOnEquity === 'number' ? item.returnOnEquity : null,
          
          marketCap: typeof item.marketCap === 'number' ? item.marketCap : null,
          sector: item.sector || 'Unknown',
          industry: item.industry || 'Unknown',
          dividendYield: typeof item.dividendYield === 'number' ? item.dividendYield : null,
          netProfitMargin: typeof item.netProfitMargin === 'number' ? item.netProfitMargin : null,
          debtEquityRatio: typeof item.debtEquityRatio === 'number' ? item.debtEquityRatio : null,
        }));
      }
    } catch (e) {
      log(`[ERROR] Parsing fehlgeschlagen. Versuche nächstes Batch.`);
    }

    return { stocks, sources };
  } catch (error: any) {
    log(`[FATAL] Research Error: ${error.message}`);
    return { stocks: [], sources: [] };
  }
};
