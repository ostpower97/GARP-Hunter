import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Debug State
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, debugMode]);

  // Scan logic
  const scanMarket = useCallback(async (indexId: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStocks([]); 
    setLogs([]); // Clear logs on new scan
    addLog(`Starting scan for index: ${indexId}`);
    
    const indexDef = INDICES.find(i => i.id === indexId);
    if (!indexDef) {
        const msg = "Index nicht gefunden.";
        setError(msg);
        addLog(`[FATAL] ${msg}`);
        setLoading(false);
        return;
    }

    const tickers = indexDef.tickers;
    const total = tickers.length;
    addLog(`Found ${total} tickers to scan.`);

    const batchSize = 3; 
    const results: StockData[] = [];

    for (let i = 0; i < total; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      
      const promises = batch.map(sym => fetchStockDetails(sym, addLog));
      const batchResults = await Promise.all(promises);
      
      const validData = batchResults.filter((s): s is StockData => s !== null);
      results.push(...validData);
      
      setStocks(prev => [...prev, ...validData]);
      setProgress(Math.round(((i + batch.length) / total) * 100));
      
      // Kleiner Delay um Rate Limits zu vermeiden
      await new Promise(r => setTimeout(r, 200));
    }

    addLog(`Scan complete. Found ${results.length} valid stocks.`);
    setLoading(false);
    setProgress(100);
  }, [addLog]);

  // Trigger scan when index changes
  useEffect(() => {
    scanMarket(selectedIndex);
  }, [selectedIndex, scanMarket]);

  // Apply filters locally
  useEffect(() => {
    const filtered = stocks.filter(s => {
      // 1. Must have valid PEG (or at least valid PE + Growth to be considered)
      if (s.pegRatio === null && (s.forwardPE === null || s.earningsGrowth === null)) return false;

      // 2. PEG Check 
      if (s.pegRatio !== null && s.pegRatio > filters.maxPeg) return false;
      
      // 3. PE Check
      if (s.forwardPE !== null && s.forwardPE > filters.maxPe) return false;

      // 4. Growth Check
      if (s.earningsGrowth !== null && s.earningsGrowth < filters.minGrowth) return false;
      
      // 5. ROE Check
      if (s.returnOnEquity !== null && s.returnOnEquity < filters.minRoe) return false;

      return true;
    });

    filtered.sort((a, b) => {
      const pegA = a.pegRatio || 999;
      const pegB = b.pegRatio || 999;
      return pegA - pegB;
    });

    setFilteredStocks(filtered);
  }, [stocks, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 relative">
      
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
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 hidden sm:block">
              Powered by Yahoo Finance
            </div>
            <button 
                onClick={() => setDebugMode(!debugMode)}
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${debugMode ? 'text-green-400' : 'text-slate-500'}`}
                title="Debug Log öffnen"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 1-7.77"/><path d="M12 20c3.3 0 6-2.7 6-6v-3a4 4 0 0 0-1-7.77"/><path d="M12 12v8"/><path d="M16 16v4"/><path d="M8 16v4"/>
                </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Debug Console */}
        {debugMode && (
            <div className="mb-8 bg-black/80 border border-slate-700 rounded-lg p-4 font-mono text-xs text-green-400 h-64 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                    <span className="font-bold">SYSTEM LOG</span>
                    <button onClick={() => setLogs([])} className="text-slate-500 hover:text-white">Clear</button>
                </div>
                <div ref={logContainerRef} className="overflow-y-auto flex-1 space-y-1">
                    {logs.length === 0 && <span className="text-slate-600">Warte auf Logs...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="break-words border-b border-slate-800/50 pb-0.5">{log}</div>
                    ))}
                </div>
            </div>
        )}

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
              (aus {stocks.length} erfolgreich gescannt)
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
              <p className="text-slate-400 text-lg">
                {stocks.length > 0 
                    ? "Aktien wurden geladen, aber alle wurden durch Ihre Filter versteckt." 
                    : "Keine Aktien gefunden. Die API könnte blockiert sein."}
              </p>
              <p className="text-slate-600 text-sm mt-2">
                {stocks.length > 0 
                    ? "Versuchen Sie, das max. KGV oder PEG zu erhöhen. Nutzen Sie den Debug-Modus (Käfer oben rechts) zur Analyse."
                    : "Bitte aktivieren Sie den Debug-Modus oben rechts, um den Fehler zu sehen."}
              </p>
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