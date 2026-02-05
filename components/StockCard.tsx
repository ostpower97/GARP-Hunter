
import React from 'react';
import { StockData } from '../types';

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  // Helper functions to safely format numbers and percentages
  // Prevents "Cannot read properties of undefined (reading 'toFixed')"
  const fmtPct = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return `${(val * 100).toFixed(2)}%`;
  };
  
  const fmtNum = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toFixed(2);
  };
  
  const getPegColor = (peg: number | null | undefined) => {
    if (peg === null || peg === undefined) return 'text-slate-500';
    if (peg < 1.0) return 'text-emerald-400 font-bold';
    if (peg < 1.5) return 'text-emerald-300';
    if (peg < 2.5) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getRoeColor = (roe: number | null | undefined) => {
    if (roe === null || roe === undefined) return 'text-slate-500';
    return roe > 0.15 ? 'text-blue-400 font-bold' : 'text-slate-300';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-indigo-500/40 transition-all group backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
              {stock.symbol || 'N/A'}
            </h3>
            {stock.dividendYield && stock.dividendYield > 0.03 && (
               <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">DIVIDEND</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate w-40" title={stock.shortName || ''}>
            {stock.shortName || 'Unknown Company'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-white">
            {/* Safe access to currentPrice */}
            {stock.currentPrice !== undefined && stock.currentPrice !== null 
              ? stock.currentPrice.toFixed(2) 
              : '0.00'}
            <span className="text-[10px] text-slate-500 ml-1 uppercase">{stock.currency || 'USD'}</span>
          </p>
          <p className="text-[10px] text-slate-600 font-mono truncate max-w-[100px]">{stock.industry || 'Diversified'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Haupt-Metriken */}
        <div className="space-y-3">
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="block text-[10px] uppercase tracking-tighter text-slate-500 mb-1">PEG Ratio</span>
            <span className={`text-sm font-mono ${getPegColor(stock.pegRatio)}`}>{fmtNum(stock.pegRatio)}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="block text-[10px] uppercase tracking-tighter text-slate-500 mb-1">ROE</span>
            <span className={`text-sm font-mono ${getRoeColor(stock.returnOnEquity)}`}>{fmtPct(stock.returnOnEquity)}</span>
          </div>
        </div>

        {/* Qualitäts-Metriken */}
        <div className="space-y-3">
           <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="block text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Profit Margin</span>
            <span className="text-sm font-mono text-slate-300">{fmtPct(stock.netProfitMargin)}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <span className="block text-[10px] uppercase tracking-tighter text-slate-500 mb-1">Debt/Equity</span>
            <span className={`text-sm font-mono ${stock.debtEquityRatio && stock.debtEquityRatio > 2 ? 'text-orange-400' : 'text-slate-300'}`}>
               {fmtNum(stock.debtEquityRatio)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px]">
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase">Div. Yield</span>
          <span className="text-blue-400 font-bold">{fmtPct(stock.dividendYield)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-500 uppercase">P/E Ratio</span>
          <span className="text-slate-300 font-mono">{fmtNum(stock.trailingPE)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
