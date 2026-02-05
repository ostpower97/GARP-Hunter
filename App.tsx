
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, debugMode]);

  const scanMarket = useCallback(async (indexId: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStocks([]); 
    setLogs([]);
    addLog(`YAHOO ENGINE: Initialisiere Scan für ${indexId}...`);
    
    const indexDef = INDICES.find(i => i.id === indexId);
    if (!indexDef) {
        setError("Index nicht gefunden.");
        setLoading(false);
        return;
    }

    const tickers = indexDef.tickers;
    const total = tickers.length;
    
    // BatchSize=1 für maximale Stabilität (Sequentielles Abarbeiten)
    // Yahoo Query API mag zu viele parallele Requests über denselben Proxy oft nicht.
    const results: StockData[] = [];

    for (let i = 0; i < total; i++) {
      const sym = tickers[i];
      const stock = await fetchStockDetails(sym, "", addLog);
      
      if (stock) {
        results.push(stock);
        setStocks(prev => [...prev, stock]);
        addLog(`[SUCCESS] ${sym} geladen.`);
      }
      
      setProgress(Math.round(((i + 1) / total) * 100));
      
      // Kurze Pause zur Schonung der API
      await new Promise(r => setTimeout(r, 200));
    }

    addLog(`SCAN KOMPLETT: ${results.length} Kandidaten erfolgreich analysiert.`);
    setLoading(false);
    setProgress(100);
  }, [addLog]);

  useEffect(() => {
    scanMarket(selectedIndex);
  }, [selectedIndex, scanMarket]);

  useEffect(() => {
    const filtered = stocks.filter(s => {
      // GARP Regeln
      if (s.pegRatio === null) return false;
      if (s.pegRatio > filters.maxPeg) return false;
      if (s.trailingPE !== null && s.trailingPE > filters.maxPe) return false;
      if (s.returnOnEquity !== null && s.returnOnEquity < filters.minRoe) return false;
      if (s.earningsGrowth !== null && s.earningsGrowth < filters.minGrowth) return false;
      return true;
    });

    filtered.sort((a, b) => (a.pegRatio || 999) - (b.pegRatio || 999));
    setFilteredStocks(filtered);
  }, [stocks, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">Y!</div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">GARP HUNTER</h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-1">Yahoo Stable Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Terminal Status</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Connected to Query2
                </span>
             </div>
             <button 
               onClick={() => setDebugMode(!debugMode)} 
               className={`p-2.5 rounded-xl transition-all ${debugMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6 4 4 8-8"/><path d="M14 8h8v8"/></svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {debugMode && (
            <div className="mb-8 bg-black/90 border border-indigo-500/30 rounded-2xl p-4 font-mono text-[10px] text-indigo-400 h-56 overflow-hidden flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                    <span className="font-bold opacity-60">YAHOO_TERMINAL_V2</span>
                    <button onClick={() => setLogs([])} className="hover:text-white uppercase text-[9px] font-bold">Clear Log</button>
                </div>
                <div ref={logContainerRef} className="overflow-y-auto flex-1 scrollbar-hide space-y-0.5">
                    {logs.map((log, i) => <div key={i} className="py-0.5 border-b border-white/5 opacity-80 hover:opacity-100">{log}</div>)}
                </div>
            </div>
        )}

        <div className="mb-8 overflow-x-auto pb-2 flex gap-2 hide-scrollbar">
          {INDICES.map((idx) => (
            <button 
              key={idx.id} 
              onClick={() => !loading && setSelectedIndex(idx.id)} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedIndex === idx.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'} ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {idx.name}
            </button>
          ))}
        </div>

        <FilterPanel filters={filters} setFilters={setFilters} disabled={loading} />

        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black">SCAN RESULTS</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
              Gefiltert: <span className="text-indigo-500">{filteredStocks.length}</span> / {stocks.length} Geladen
            </p>
          </div>
          {loading && (
             <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                 <span className="text-[10px] font-black font-mono text-indigo-400">ANALYSING... {progress}%</span>
               </div>
               <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
             </div>
          )}
        </div>

        {filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStocks.map((stock) => <StockCard key={stock.symbol} stock={stock} />)}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-40 bg-slate-900/30 rounded-[32px] border-2 border-dashed border-slate-800">
              <p className="text-slate-500 font-bold text-lg">Keine Treffer.</p>
              <p className="text-xs text-slate-600 mt-2">Versuche die Filterkriterien zu lockern.</p>
            </div>
          )
        )}
      </main>

      {!loading && (
        <button 
          onClick={() => scanMarket(selectedIndex)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 border-4 border-slate-950"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>
      )}
    </div>
  );
}

export default App;
