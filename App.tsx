
import React, { useState, useEffect } from 'react';
import { CATEGORIES, getIcon } from './constants';
import { NewsItem, AppState } from './types';
import { fetchNewsByCategory } from './services/geminiService';
import { getStoredNews, saveNewsToDb, getLastUpdatedTime } from './services/storageService';
import NewsCard from './components/NewsCard';
import VoiceControl from './components/VoiceControl';
import NotificationBanner from './components/NotificationBanner';
import { Radio, AlertOctagon, RotateCw, Menu, X, Database } from 'lucide-react';

const App: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0].id);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyMissing(true);
        return;
    }
    
    // Check DB first
    const stored = getStoredNews(activeCategoryId);
    const updatedTime = getLastUpdatedTime(activeCategoryId);
    
    if (stored && stored.length > 0) {
        setNews(stored);
        setLastUpdated(updatedTime);
        setAppState(AppState.SUCCESS);
    } else {
        loadNews(activeCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId]);

  const loadNews = async (categoryId: string, forceRefresh = false) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const items = await fetchNewsByCategory(categoryId);
      if (items.length > 0) {
        setNews(items);
        saveNewsToDb(categoryId, items);
        setLastUpdated(new Date().toLocaleString());
        setAppState(AppState.SUCCESS);
      } else {
         setError("No significant events found in this sector recently.");
         setAppState(AppState.ERROR);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve intelligence data. Systems may be offline or rate limited.");
      setAppState(AppState.ERROR);
    }
  };

  const handleRefresh = () => {
    loadNews(activeCategoryId, true);
  };

  if (apiKeyMissing) {
      return (
          <div className="min-h-screen bg-black text-red-600 flex flex-col items-center justify-center p-8 text-center font-mono">
              <AlertOctagon className="w-24 h-24 mb-6 animate-pulse" />
              <h1 className="text-4xl font-bold mb-4">SYSTEM LOCKED</h1>
              <p className="max-w-md text-gray-400">
                  Critical security missing: <code className="bg-red-900/20 px-2 py-1 text-red-500">API_KEY</code> environment variable not detected.
                  <br/><br/>
                  Please configure access to Gemini Protocol.
              </p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-sans selection:bg-red-900 selection:text-white overflow-x-hidden flex flex-col">
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-xl transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-display font-bold text-white tracking-tighter">
                    CRISIS<span className="text-red-500">WATCH</span>
                </span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            <nav className="space-y-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategoryId(cat.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all border ${
                            activeCategoryId === cat.id 
                            ? `bg-${cat.color}-500/10 border-${cat.color}-500 text-${cat.color}-500 font-bold` 
                            : 'bg-dark-800 border-transparent text-gray-400'
                        }`}
                    >
                        {getIcon(cat.icon, "w-6 h-6")}
                        <span className="uppercase tracking-wider text-sm">{cat.name}</span>
                    </button>
                ))}
            </nav>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-dark-900 border-r border-dark-800 h-full p-6 relative z-20">
            <div className="mb-10 flex items-center space-x-2">
                <div className="relative">
                    <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                    <span className="absolute inset-0 bg-red-500 blur-lg opacity-20 animate-pulse"></span>
                </div>
                <span className="text-2xl font-display font-bold text-white tracking-tighter">
                    CRISIS<span className="text-red-500">WATCH</span>
                </span>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto hide-scrollbar pb-6">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all group border ${
                            activeCategoryId === cat.id 
                            ? `bg-${cat.color}-500/10 border-${cat.color}-500/50 text-${cat.color}-400 shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] shadow-${cat.color}-500/10` 
                            : 'border-transparent text-gray-500 hover:bg-dark-800 hover:text-gray-200'
                        }`}
                    >
                        {getIcon(cat.icon, `w-5 h-5 ${activeCategoryId === cat.id ? `text-${cat.color}-500` : 'group-hover:text-white'}`)}
                        <span className="text-sm font-medium tracking-wide">{cat.name}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-dark-800">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="uppercase tracking-widest font-bold">Database Status</span>
                    <Database className="w-3 h-3" />
                </div>
                <div className="bg-dark-800 rounded p-3 text-xs">
                     <div className="flex items-center space-x-2 text-green-500 mb-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Synced</span>
                    </div>
                    <div className="text-gray-600 truncate">
                        Last Update: <br/> {lastUpdated || 'Never'}
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-dark-900">
            
            {/* Header */}
            <header className="h-20 border-b border-dark-800 flex items-center justify-between px-6 lg:px-10 bg-dark-900/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-display font-bold text-xl">CRISIS<span className="text-red-500">WATCH</span></span>
                </div>

                <div className="hidden lg:flex flex-col">
                     <h1 className={`text-2xl font-display font-bold uppercase tracking-wide flex items-center gap-3 text-white`}>
                        {activeCategory.name}
                        <span className={`text-xs px-2 py-0.5 rounded border border-${activeCategory.color}-500/30 text-${activeCategory.color}-500 bg-${activeCategory.color}-500/10`}>
                            Live Feed
                        </span>
                     </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <VoiceControl onCategoryChange={setActiveCategoryId} onRefresh={handleRefresh} />
                    
                    <button 
                        onClick={handleRefresh}
                        disabled={appState === AppState.LOADING}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-full border border-dark-700 bg-dark-800 hover:bg-dark-700 transition-all ${
                            appState === AppState.LOADING ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        title="Force Database Refresh"
                    >
                        <RotateCw className={`w-4 h-4 text-gray-400 group-hover:text-white ${appState === AppState.LOADING ? 'animate-spin text-red-500' : ''}`} />
                        <span className="hidden md:inline text-xs font-bold text-gray-400 group-hover:text-white uppercase">
                            {appState === AppState.LOADING ? 'Scanning...' : 'Refresh DB'}
                        </span>
                    </button>
                </div>
            </header>

            {/* Notification Banner */}
            <NotificationBanner news={news} currentCategory={activeCategoryId} />

            {/* News Grid */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                {appState === AppState.LOADING && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-dark-800 h-96 rounded-2xl border border-dark-700"></div>
                        ))}
                    </div>
                )}

                {appState === AppState.ERROR && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="bg-red-500/10 p-6 rounded-full mb-6">
                             <AlertOctagon className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Signal Lost</h2>
                        <p className="text-gray-500 max-w-md mb-8">{error}</p>
                        <button 
                            onClick={handleRefresh}
                            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold uppercase tracking-wider text-sm shadow-lg shadow-red-900/20"
                        >
                            Reconnect
                        </button>
                    </div>
                )}

                {appState === AppState.SUCCESS && news.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                         <div className="bg-dark-800 p-8 rounded-full mb-4">
                             {getIcon(activeCategory.icon, "w-12 h-12 opacity-50")}
                         </div>
                         <p className="text-lg">No critical alerts detected in {activeCategory.name}.</p>
                         <button onClick={handleRefresh} className="mt-4 text-red-500 hover:text-red-400 text-sm font-bold">Force Deep Scan</button>
                    </div>
                )}

                {appState === AppState.SUCCESS && news.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                        {news.map((item, index) => (
                            <NewsCard 
                                key={item.id || index} 
                                item={item} 
                                category={activeCategory}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
