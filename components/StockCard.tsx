import React from 'react';
import { StockData } from '../types';

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  
  // Format helpers
  const fmtPct = (val: number | null) => val ? `${(val * 100).toFixed(2)}%` : 'N/A';
  const fmtNum = (val: number | null) => val ? val.toFixed(2) : 'N/A';
  
  // Color helpers based on GARP rules
  const getPegColor = (peg: number | null) => {
    if (!peg) return 'text-gray-500';
    if (peg < 1.0) return 'text-green-400 font-bold'; // Super cheap
    if (peg < 1.5) return 'text-green-300'; // Good
    if (peg < 2.0) return 'text-yellow-400'; // Okay
    return 'text-red-400'; // Expensive
  };

  const getGrowthColor = (growth: number | null) => {
    if (!growth) return 'text-gray-500';
    if (growth > 0.20) return 'text-green-400 font-bold';
    if (growth > 0.10) return 'text-green-300';
    if (growth > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all hover:border-blue-500/50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
          <p className="text-xs text-slate-400 truncate w-32 md:w-48" title={stock.shortName}>{stock.shortName}</p>
          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-slate-700 px-2 py-0.5 rounded text-slate-300">
            {stock.sector}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono text-white">
            {stock.currentPrice.toFixed(2)} <span className="text-xs text-slate-500">{stock.currency}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-4 bg-slate-900/50 p-3 rounded">
        
        {/* PEG RATIO */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-0.5">PEG Ratio</span>
          <span className={`font-mono ${getPegColor(stock.pegRatio)}`}>
            {fmtNum(stock.pegRatio)}
          </span>
        </div>

        {/* GROWTH */}
        <div className="flex flex-col text-right">
          <span className="text-xs text-slate-500 mb-0.5">Earnings Growth</span>
          <span className={`font-mono ${getGrowthColor(stock.earningsGrowth)}`}>
            {fmtPct(stock.earningsGrowth)}
          </span>
        </div>

        {/* ROE */}
        <div className="flex flex-col border-t border-slate-700 pt-2">
          <span className="text-xs text-slate-500 mb-0.5">ROE</span>
          <span className={stock.returnOnEquity && stock.returnOnEquity > 0.15 ? 'text-blue-300' : 'text-slate-300'}>
            {fmtPct(stock.returnOnEquity)}
          </span>
        </div>

        {/* FWD PE */}
        <div className="flex flex-col text-right border-t border-slate-700 pt-2">
          <span className="text-xs text-slate-500 mb-0.5">Forward P/E</span>
          <span className="text-slate-300 font-mono">
            {fmtNum(stock.forwardPE)}
          </span>
        </div>

      </div>
    </div>
  );
};

export default StockCard;