import React from 'react';
import { FilterSettings } from '../types';

interface FilterPanelProps {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  disabled: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, disabled }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6">
      <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">GARP Kriterien Konfiguration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* MAX PEG */}
        <div>
          <label className="block text-xs text-slate-400 mb-2 flex justify-between">
            <span>Max PEG Ratio</span>
            <span className="text-blue-400 font-mono">{filters.maxPeg.toFixed(1)}</span>
          </label>
          <input
            type="range"
            name="maxPeg"
            min="0.5"
            max="5.0"
            step="0.1"
            value={filters.maxPeg}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">Niedriger ist besser (Unter 1.5 ideal)</p>
        </div>

        {/* MIN GROWTH */}
        <div>
          <label className="block text-xs text-slate-400 mb-2 flex justify-between">
            <span>Min. Wachstum (YoY)</span>
            <span className="text-blue-400 font-mono">{(filters.minGrowth * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            name="minGrowth"
            min="0"
            max="0.5"
            step="0.05"
            value={filters.minGrowth}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
           <p className="text-[10px] text-slate-500 mt-1">Gewinnwachstum pro Quartal</p>
        </div>

        {/* MAX PE */}
        <div>
          <label className="block text-xs text-slate-400 mb-2 flex justify-between">
            <span>Max Forward P/E</span>
            <span className="text-blue-400 font-mono">{filters.maxPe}</span>
          </label>
          <input
            type="range"
            name="maxPe"
            min="10"
            max="100"
            step="5"
            value={filters.maxPe}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">Vermeidet überhypte Aktien</p>
        </div>

         {/* MIN ROE */}
         <div>
          <label className="block text-xs text-slate-400 mb-2 flex justify-between">
            <span>Min. ROE</span>
            <span className="text-blue-400 font-mono">{(filters.minRoe * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            name="minRoe"
            min="0"
            max="0.4"
            step="0.02"
            value={filters.minRoe}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">Return on Equity (Qualität)</p>
        </div>

      </div>
    </div>
  );
};

export default FilterPanel;