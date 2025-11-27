
import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { Bell, AlertTriangle, X } from 'lucide-react';

interface NotificationBannerProps {
  news: NewsItem[];
  currentCategory: string;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ news, currentCategory }) => {
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Filter for exciting/tragic news (High Severity) specifically in Tech or Catastrophe categories
    // or generally high impact items across the current view if relevant.
    // The user requested notifications for "Exciting news" especially "catastrophes and tech".
    
    // We can show this banner regardless of the active view if we had a global store,
    // but based on current architecture, we filter the PASSED news prop.
    // If the user is on "Education", they won't see Tech news unless we fetch it globally.
    // However, assuming the 'news' prop reflects the current category:
    
    // Logic: If current category is Tech or Catastrophe, highlight top items.
    // If not, we could technically hide it, OR we can show High Impact items from current category.
    // Let's implement a feature that highlights CRITICAL items from the current list.
    
    const critical = news.filter(item => 
        (item.severity === 'CRITICAL' || item.severity === 'HIGH')
    );
    
    if (critical.length > 0) {
        setBreakingNews(critical);
        setVisible(true);
    } else {
        setVisible(false);
    }
  }, [news]);

  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, [breakingNews]);

  if (!visible || breakingNews.length === 0) return null;

  const currentItem = breakingNews[currentIndex];
  const isCatastrophe = currentCategory === 'catastrophe';

  return (
    <div className="bg-gradient-to-r from-red-900/90 to-dark-900 border-b border-red-500/30 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative z-10">
            <div className="flex items-center flex-1 overflow-hidden">
                <div className="flex-shrink-0 mr-4 flex items-center gap-2 animate-pulse text-red-400 font-bold uppercase tracking-widest text-xs">
                    {isCatastrophe ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span>Breaking {isCatastrophe ? 'Alert' : 'Update'}</span>
                </div>
                
                <div className="flex-1 truncate">
                    <span className="font-display text-sm md:text-base font-medium mr-2 text-white">
                        {currentItem.headline}
                    </span>
                    <span className="text-xs text-gray-400 hidden md:inline">
                         — {currentItem.location}
                    </span>
                </div>
            </div>
            
            <button 
                onClick={() => setVisible(false)}
                className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
        
        {/* Progress bar for rotation */}
        {breakingNews.length > 1 && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-red-500/50 animate-[width_5s_linear_infinite]" style={{ width: '100%' }}></div>
        )}
    </div>
  );
};

export default NotificationBanner;
