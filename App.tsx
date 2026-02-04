import React, { useState, useEffect, useCallback } from 'react';
import { INDICES, DEFAULT_FILTERS } from './constants';
import { StockData, FilterSettings } from './types';
import { fetchStockDetails } from './services/yahooService';
import StockCard from './components/StockCard';
import FilterPanel from './components/FilterPanel';

function App() {
  const [selectedIndex, setSelectedIndex] = useState<string>(INDICES[0].id);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Scan logic
  const scanMarket = useCallback(async (indexId: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStocks([]); // Clear previous
    
    const indexDef = INDICES.find(i => i.id === indexId);
    if (!indexDef) {
        setError("Index nicht gefunden.");
        setLoading(false);
        return;
    }

    const tickers = indexDef.tickers;
    const total = tickers.length;
    const batchSize = 3; // Yahoo kann zickig sein, also kleine Batches
    const results: StockData[] = [];

    // Wir laden die Daten "parallel" in Batches, um nicht zu langsam zu sein,
    // aber auch nicht das Rate Limit zu sprengen.
    for (let i = 0; i < total; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      
      const promises = batch.map(sym => fetchStockDetails(sym));
      const batchResults = await Promise.all(promises);
      
      // Filter out nulls (failed fetches)
      const validData = batchResults.filter((s): s is StockData => s !== null);
      results.push(...validData);
      
      // Update intermediate results for UX
      setStocks(prev => [...prev, ...validData]);
      setProgress(Math.round(((i + batch.length) / total) * 100));
      
      // Kleiner Delay um nett zur API zu sein
      await new Promise(r => setTimeout(r, 200));
    }

    setLoading(false);
    setProgress(100);
  }, []);

  // Trigger scan when index changes
  useEffect(() => {
    scanMarket(selectedIndex);
  }, [selectedIndex, scanMarket]);

  // Apply filters locally whenever stocks or filters change
  useEffect(() => {
    const filtered = stocks.filter(s => {
      // 1. Must have valid PEG (or at least valid PE + Growth to be considered)
      if (s.pegRatio === null && (s.forwardPE === null || s.earningsGrowth === null)) return false;

      // 2. PEG Check (if PEG exists)
      if (s.pegRatio !== null && s.pegRatio > filters.maxPeg) return false;
      
      // 3. PE Check
      if (s.forwardPE !== null && s.forwardPE > filters.maxPe) return false;

      // 4. Growth Check
      if (s.earningsGrowth !== null && s.earningsGrowth < filters.minGrowth) return false;
      
      // 5. ROE Check
      if (s.returnOnEquity !== null && s.returnOnEquity < filters.minRoe) return false;

      return true;
    });

    // Sort by PEG ascending (Best GARP matches first)
    filtered.sort((a, b) => {
      const pegA = a.pegRatio || 999;
      const pegB = b.pegRatio || 999;
      return pegA - pegB;
    });

    setFilteredStocks(filtered);
  }, [stocks, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              G
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              GARP Hunter <span className="text-xs text-blue-400 font-mono border border-blue-900 bg-blue-900/20 px-1 rounded ml-1">PRO</span>
            </h1>
          </div>
          
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Yahoo Finance & Vercel
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Index Selector */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {INDICES.map((idx) => (
              <button
                key={idx.id}
                onClick={() => !loading && setSelectedIndex(idx.id)}
                disabled={loading}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${selectedIndex === idx.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {idx.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          disabled={loading}
        />

        {/* Status Bar / Progress */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">
            Ergebnisse: <span className="text-blue-400">{filteredStocks.length}</span> Treffer
            <span className="text-slate-500 text-sm font-normal ml-2">
              (aus {stocks.length} gescannt)
            </span>
          </h2>
          {loading && (
             <div className="flex items-center gap-3">
               <span className="text-xs text-blue-300 animate-pulse">Scanning Market... {progress}%</span>
               <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                 />
               </div>
             </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
              <p className="text-slate-400 text-lg">Keine Aktien gefunden, die den GARP Kriterien entsprechen.</p>
              <p className="text-slate-600 text-sm mt-2">Versuchen Sie, den PEG-Filter zu erhöhen oder das Mindestwachstum zu senken.</p>
              <button 
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Filter zurücksetzen
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;