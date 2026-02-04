import { IndexDefinition, FilterSettings } from './types';

export const DEFAULT_FILTERS: FilterSettings = {
  maxPeg: 2.0,      // Klassisch GARP < 1.0 oder 1.5, aber 2.0 erlaubt mehr Treffer
  maxPe: 40,        // Nicht zu teuer
  minGrowth: 0.10,  // Mindestens 10% Wachstum
  minRoe: 0.12,     // Solides Management
};

// Hinweis: Dies sind statische Listen der Top-Holdings, da Yahoo keine einfache API
// für "Alle Komponenten eines Index" bietet ohne Scraping.
export const INDICES: IndexDefinition[] = [
  {
    id: 'DAX',
    name: 'DAX 40 (DE)',
    tickers: [
      'SAP.DE', 'SIE.DE', 'ALV.DE', 'DTE.DE', 'AIR.DE', 'MBG.DE', 'BMW.DE', 'VOW3.DE', 
      'BAS.DE', 'MUV2.DE', 'IFX.DE', 'DHL.DE', 'DB1.DE', 'BEI.DE', 'HEN3.DE', 'RWE.DE',
      'EOAN.DE', 'VNA.DE', 'SHL.DE', 'ADS.DE', 'DBK.DE', 'BAYN.DE', 'HEI.DE', 'SY1.DE'
    ]
  },
  {
    id: 'SP500',
    name: 'S&P 500 (US Top)',
    tickers: [
      'MSFT', 'AAPL', 'NVDA', 'AMZN', 'GOOGL', 'META', 'BRK-B', 'LLY', 'AVGO', 'JPM',
      'TSLA', 'XOM', 'UNH', 'V', 'PG', 'MA', 'JNJ', 'HD', 'MRK', 'COST', 'ABBV', 'CVX',
      'CRM', 'BAC', 'AMD', 'NFLX', 'PEP', 'KO', 'DIS', 'ADBE'
    ]
  },
  {
    id: 'NASDAQ',
    name: 'Nasdaq 100 (Tech)',
    tickers: [
      'MSFT', 'AAPL', 'NVDA', 'AMZN', 'AVGO', 'META', 'TSLA', 'GOOGL', 'COST', 'NFLX',
      'AMD', 'ADBE', 'PEP', 'LIN', 'CSCO', 'TMUS', 'INTC', 'QCOM', 'TXN', 'AMAT',
      'HON', 'AMGN', 'ISRG', 'SBUX', 'BKNG', 'GILD', 'ADP', 'MDLZ', 'REGN', 'VRTX'
    ]
  },
  {
    id: 'DOW',
    name: 'Dow Jones (US)',
    tickers: [
      'UNH', 'MSFT', 'GS', 'HD', 'CAT', 'AMGN', 'MCD', 'V', 'CRM', 'BA',
      'HON', 'TRV', 'CVX', 'AXP', 'AAPL', 'WMT', 'JPM', 'IBM', 'JNJ', 'PG',
      'MRK', 'NKE', 'DIS', 'MMM', 'KO', 'DOW', 'CSCO', 'VZ', 'INTC', 'WBA'
    ]
  },
  {
    id: 'CAC',
    name: 'CAC 40 (FR)',
    tickers: [
      'MC.PA', 'OR.PA', 'TTE.PA', 'SAN.PA', 'AIR.PA', 'SU.PA', 'AI.PA', 'BN.PA', 'EL.PA',
      'KER.PA', 'CS.PA', 'BNP.PA', 'GLE.PA', 'ACA.PA', 'ORA.PA', 'CAP.PA', 'STM.PA', 'RI.PA'
    ]
  },
  {
    id: 'UK100',
    name: 'FTSE 100 (UK)',
    tickers: [
      'AZN.L', 'SHELL.L', 'HSBC.L', 'ULVR.L', 'BP.L', 'RIO.L', 'DGE.L', 'REL.L', 'GSK.L',
      'GLEN.L', 'BATS.L', 'LSEG.L', 'AAL.L', 'CNA.L', 'NG.L', 'LLOY.L', 'BARC.L', 'VOD.L'
    ]
  }
];