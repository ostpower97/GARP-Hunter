import { IndexDefinition, FilterSettings } from './types';

export const DEFAULT_FILTERS: FilterSettings = {
  maxPeg: 2.5,
  maxPe: 65,
  minGrowth: 0.10,
  minRoe: 0.10,
};

export const INDICES: IndexDefinition[] = [
  {
    id: 'DAX',
    name: 'DAX 40 (Complete)',
    tickers: [
      'ADS.DE', 'AIR.DE', 'ALV.DE', 'BAS.DE', 'BAYN.DE', 'BEI.DE', 'BMW.DE', 'BNR.DE',
      'CBK.DE', 'CON.DE', '1COV.DE', 'DTG.DE', 'DBK.DE', 'DB1.DE', 'DHL.DE', 'DTE.DE',
      'EOAN.DE', 'FRE.DE', 'HNR1.DE', 'HEI.DE', 'HEN3.DE', 'IFX.DE', 'MBG.DE', 'MRK.DE',
      'MTX.DE', 'MUV2.DE', 'PUM.DE', 'QIAGEN.DE', 'RHM.DE', 'RWE.DE', 'SAP.DE', 'SRT3.DE',
      'SIE.DE', 'ENR.DE', 'SY1.DE', 'VOW3.DE', 'VNA.DE', 'ZAL.DE', 'SHL.DE', 'BCH.DE'
    ]
  },
  {
    id: 'NASDAQ',
    name: 'Nasdaq 100 (Complete)',
    tickers: [
      'AAPL', 'ABNB', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AEP', 'AMAT', 'AMD', 'AMGN', 'AMZN',
      'ANSS', 'APP', 'ASML', 'AVGO', 'AZN', 'BIIB', 'BKNG', 'BKR', 'CCEP', 'CDNS', 'CDW',
      'CEG', 'CHTR', 'CMCSA', 'COST', 'CPRT', 'CRWD', 'CSCO', 'CSX', 'CTAS', 'CTSH',
      'DDOG', 'DLTR', 'DXCM', 'EA', 'EXC', 'FANG', 'FAST', 'FTNT', 'GEHC', 'GFS', 'GILD',
      'GOOG', 'GOOGL', 'HON', 'IDXX', 'ILMN', 'INTC', 'INTU', 'ISRG', 'KDP', 'KHC',
      'KLAC', 'LIN', 'LRCX', 'LULU', 'MAR', 'MCHP', 'MDLZ', 'MELI', 'META', 'MNST',
      'MRNA', 'MRVL', 'MSFT', 'MU', 'NFLX', 'NVDA', 'NXPI', 'ODFL', 'ON', 'ORLY',
      'PANW', 'PAYX', 'PCAR', 'PDD', 'PEP', 'PYPL', 'QCOM', 'REGN', 'ROP', 'ROST',
      'SBUX', 'SIRI', 'SNPS', 'TEAM', 'TMUS', 'TSLA', 'TTD', 'TTWO', 'TXN', 'VRSK',
      'VRTX', 'WBD', 'WDAY', 'XEL', 'ZS', 'NOW'
    ]
  },
  {
    id: 'DOW',
    name: 'Dow Jones 30 (Complete)',
    tickers: [
      'MMM', 'AXP', 'AMGN', 'AAPL', 'BA', 'CAT', 'CVX', 'CSCO', 'KO', 'DIS', 'DOW',
      'GS', 'HD', 'HON', 'IBM', 'INTC', 'JNJ', 'JPM', 'MCD', 'MRK', 'MSFT', 'NKE',
      'PG', 'CRM', 'TRV', 'UNH', 'VZ', 'V', 'WBA', 'WMT'
    ]
  },
  {
    id: 'CAC',
    name: 'CAC 40 (Complete)',
    tickers: [
      'AC.PA', 'ACA.PA', 'AI.PA', 'AIR.PA', 'ALO.PA', 'BN.PA', 'BNP.PA', 'CA.PA', 'CAP.PA',
      'CS.PA', 'DG.PA', 'DSY.PA', 'EDEN.PA', 'EN.PA', 'EL.PA', 'ERF.PA', 'GLE.PA', 'HO.PA',
      'KER.PA', 'LR.PA', 'MC.PA', 'ML.PA', 'OR.PA', 'ORA.PA', 'PUB.PA', 'RI.PA', 'RNO.PA',
      'RMS.PA', 'SAF.PA', 'SAN.PA', 'SGO.PA', 'STLAP.PA', 'STM.PA', 'SU.PA', 'SW.PA',
      'TEP.PA', 'TTE.PA', 'URW.AS', 'VIE.PA', 'VIV.PA'
    ]
  },
  {
    id: 'UK100',
    name: 'FTSE 100 (Major)',
    tickers: [
      'AAL.L', 'ABF.L', 'ADM.L', 'AHT.L', 'ANTO.L', 'AUTO.L', 'AV.L', 'AZN.L', 'BA.L',
      'BARC.L', 'BATS.L', 'BDEV.L', 'BEZ.L', 'BKGH.L', 'BNZL.L', 'BP.L', 'BRBY.L', 'BT-A.L',
      'BUN.L', 'BUR.L', 'CNA.L', 'CCH.L', 'CPG.L', 'CRDA.L', 'DCC.L', 'DGE.L', 'DPLM.L',
      'ENT.L', 'EXPN.L', 'FCIT.L', 'FLTR.L', 'FRAS.L', 'FRES.L', 'GLEN.L', 'GSK.L', 'HL.L',
      'HLMA.L', 'HSBA.L', 'HSBC.L', 'HWDN.L', 'IAG.L', 'ICP.L', 'IHG.L', 'III.L', 'IMB.L',
      'INF.L', 'ITRK.L', 'JD.L', 'KGF.L', 'LAND.L', 'LGEN.L', 'LLOY.L', 'LSEG.L', 'MNDI.L',
      'MRO.L', 'NG.L', 'NWG.L', 'NXT.L', 'OCDO.L', 'PHNX.L', 'PRU.L', 'PSN.L', 'PSON.L',
      'REL.L', 'RKT.L', 'RIO.L', 'RMV.L', 'RR.L', 'RS1.L', 'RTO.L', 'SBRY.L', 'SDR.L',
      'SGE.L', 'SGRO.L', 'SHEL.L', 'SKG.L', 'SMDS.L', 'SMIN.L', 'SMT.L', 'SN.L', 'SPX.L',
      'SSE.L', 'STAN.L', 'STJ.L', 'SVT.L', 'TSCO.L', 'TW.L', 'ULVR.L', 'UTG.L', 'UU.L',
      'VOD.L', 'WEIR.L', 'WKP.L', 'WTB.L'
    ]
  },
  {
    id: 'SP500',
    name: 'S&P 500 (Extended ~200)',
    tickers: [
      'MSFT', 'AAPL', 'NVDA', 'AMZN', 'GOOGL', 'META', 'BRK-B', 'LLY', 'AVGO', 'JPM',
      'TSLA', 'XOM', 'UNH', 'V', 'PG', 'MA', 'JNJ', 'HD', 'MRK', 'COST', 'ABBV', 'CVX',
      'CRM', 'BAC', 'AMD', 'NFLX', 'PEP', 'KO', 'DIS', 'ADBE', 'WMT', 'ACN', 'CSCO',
      'INTC', 'T', 'VZ', 'PFE', 'WFC', 'LIN', 'MCD', 'ABT', 'TMUS', 'CMCSA', 'QCOM',
      'TXN', 'DHR', 'GE', 'UNP', 'CAT', 'RTX', 'PM', 'AMGN', 'IBM', 'UBER', 'HON',
      'LOW', 'COP', 'SPGI', 'GS', 'INTU', 'PLD', 'BKNG', 'ELE', 'BLK', 'SYK', 'TJX',
      'MDLZ', 'ISRG', 'PGR', 'GILD', 'ADP', 'LRCX', 'C', 'VRTX', 'REGN', 'BSX', 'MMC',
      'CB', 'ADI', 'ETN', 'MU', 'LMT', 'SCHW', 'KLAC', 'PANW', 'FI', 'MO', 'DE', 'SNPS',
      'CI', 'CDNS', 'WM', 'ZTS', 'SO', 'ITW', 'BDX', 'SHW', 'CSX', 'CL', 'EOG', 'NOC',
      'APH', 'TGT', 'SLB', 'HUM', 'DUK', 'ICE', 'MCO', 'FCX', 'FDX', 'MAR', 'MCK',
      'PSX', 'ORCL', 'GM', 'F', 'HCA', 'NXPI', 'PSA', 'EMR', 'USB', 'PNC', 'NSC', 'GD',
      'ECL', 'IT', 'MCHP', 'APD', 'COF', 'AON', 'MS', 'USB', 'ADSK', 'CMG', 'HLT', 'AZO',
      'ROST', 'IDXX', 'MSI', 'PCAR', 'VLO', 'O', 'DXCM', 'TRV', 'PEG', 'WMB', 'AEP',
      'LULU', 'AJG', 'OXY', 'URI', 'ALL', 'KMB', 'MNST', 'JCI', 'PAYX', 'AMP', 'SRE',
      'D', 'BK', 'KR', 'YUM', 'ED', 'GWW', 'OTIS', 'RMD', 'AME', 'FAST', 'CTAS', 'CSGP',
      'GEHC', 'VRSK', 'IR', 'DAL', 'EXC', 'XEL', 'ACGL', 'MLM', 'PWR', 'KMI', 'GIS',
      'SYY', 'COR', 'ROK', 'EFX', 'HAL', 'DVN', 'HES', 'KHC', 'BKR', 'EL', 'PPG', 'VICI'
    ]
  }
];