
import React, { useState, useEffect } from 'react';
import { NewsItem, Category } from '../types';
import { PLACEHOLDER_IMAGES, getIcon } from '../constants';
import { Play, FileText, Share2, AlertCircle, Globe, Video, Calendar, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateReport, generateSpeech } from '../services/geminiService';

interface NewsCardProps {
  item: NewsItem;
  category: Category;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, category }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Image handling
  const [imgSrc, setImgSrc] = useState(item.imageUrl || PLACEHOLDER_IMAGES[category.id] || PLACEHOLDER_IMAGES['catastrophe']);

  useEffect(() => {
    setImgSrc(item.imageUrl || PLACEHOLDER_IMAGES[category.id] || PLACEHOLDER_IMAGES['catastrophe']);
  }, [item.imageUrl, category.id]);

  // Dynamic color classes based on category
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
  };
  
  const accentColor = colorMap[category.color] || 'bg-gray-500';
  const borderColor = `hover:border-${category.color}-500/50`;
  const shadowColor = `hover:shadow-${category.color}-500/20`;

  const severityColor = {
    CRITICAL: 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50',
    HIGH: 'bg-orange-600 text-white',
    MEDIUM: 'bg-yellow-600 text-white',
    LOW: 'bg-blue-600 text-white'
  };

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!details) {
      setLoadingDetails(true);
      try {
        const report = await generateReport(item.headline);
        setDetails(report);
      } catch (e) {
        setDetails("Failed to load detailed report.");
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return; 
    setIsPlaying(true);
    try {
        const textToRead = `Reporting on ${item.category}. ${item.headline}. ${item.summary}`;
        const buffer = await generateSpeech(textToRead);
        if (buffer) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            source.onended = () => setIsPlaying(false);
        } else {
            setIsPlaying(false);
        }
    } catch (e) {
        console.error(e);
        setIsPlaying(false);
    }
  };

  const isVideoSource = (url: string) => {
      const lower = url.toLowerCase();
      return lower.includes('youtube') || lower.includes('vimeo') || lower.includes('watch') || lower.includes('video');
  };

  return (
    <div className={`group relative bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden transition-all duration-300 ${borderColor} hover:shadow-2xl ${shadowColor} flex flex-col h-full`}>
      {/* Image Section */}
      <div className="h-56 overflow-hidden relative">
        <img 
          src={imgSrc} 
          alt={item.headline}
          onError={() => setImgSrc(PLACEHOLDER_IMAGES[category.id] || PLACEHOLDER_IMAGES['catastrophe'])}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent opacity-90" />
        
        {/* Top Badges */}
        <div className="absolute top-0 left-0 p-4 w-full flex justify-between items-start">
             <div className="flex flex-col gap-2">
                 <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${severityColor[item.severity]}`}>
                    {item.severity}
                 </span>
             </div>
             <div className="flex flex-col items-end gap-1">
                 <div className="bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/10 flex items-center gap-1 text-gray-300 text-xs">
                     <Calendar className="w-3 h-3" />
                     {item.timestamp}
                 </div>
             </div>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 text-gray-300 text-xs font-semibold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            <MapPin className="w-3 h-3 text-white" />
            {item.location}
        </div>
        
        {/* Play Button */}
        <div className="absolute bottom-4 right-4">
            <button 
                onClick={handlePlay}
                className={`p-3 rounded-full bg-white/10 hover:bg-${category.color}-600 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 ${isPlaying ? `animate-pulse bg-${category.color}-600` : ''}`}
                title="Listen to Briefing"
            >
                <Play className="w-5 h-5 fill-current" />
            </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
             <div className={`p-1.5 rounded-lg bg-dark-700 text-${category.color}-400`}>
                {getIcon(category.icon, "w-4 h-4")}
             </div>
             <span className={`text-xs font-bold uppercase tracking-wider text-${category.color}-500`}>
                {category.name}
             </span>
        </div>

        <h3 className="text-xl font-display font-bold text-gray-100 mb-3 leading-tight group-hover:text-white transition-colors">
            {item.headline}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
            {item.summary}
        </p>

        {/* Impact Visualizer */}
        <div className="mb-4">
             <div className="flex justify-between text-[10px] uppercase text-gray-500 font-bold mb-1">
                <span>Global Impact</span>
                <span>{item.impact_score}/100</span>
             </div>
             <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${accentColor} transition-all duration-1000`}
                    style={{ width: `${item.impact_score}%` }}
                />
             </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleExpand}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all
              ${expanded ? 'bg-dark-700 text-gray-300' : `bg-dark-700 hover:${accentColor} hover:text-white text-gray-400`}
            `}
        >
            <FileText className="w-4 h-4" />
            {expanded ? 'Close Report' : 'Detailed Report'}
        </button>

        {/* Expanded Content */}
        {expanded && (
            <div className="mt-4 pt-4 border-t border-dark-700 animate-in fade-in slide-in-from-top-2 duration-300">
                {loadingDetails ? (
                    <div className={`flex items-center gap-2 text-${category.color}-400 text-sm animate-pulse`}>
                        <AlertCircle className="w-4 h-4" /> Analyzing data streams...
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm prose-p:text-gray-400 prose-headings:text-gray-200">
                        <ReactMarkdown>{details || ''}</ReactMarkdown>
                    </div>
                )}
                
                {item.sources && item.sources.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                             <Share2 className="w-3 h-3" /> Verified Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {item.sources.map((source, idx) => {
                                const isVideo = isVideoSource(source.url);
                                return (
                                    <a 
                                        key={idx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`text-xs border px-3 py-1.5 rounded-md transition-all truncate max-w-[200px] flex items-center gap-2 ${
                                            isVideo 
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                                            : 'bg-dark-700 border-dark-600 text-gray-300 hover:bg-dark-600 hover:text-white'
                                        }`}
                                    >
                                        {isVideo ? <Video className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                        {source.title}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
