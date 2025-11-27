import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface VoiceControlProps {
  onCategoryChange: (id: string) => void;
  onRefresh: () => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCategoryChange, onRefresh }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!supported) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.toLowerCase();
      setTranscript(text);
      processCommand(text);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setTranscript(''), 2000);
    };

    recognition.start();
  };

  const processCommand = (text: string) => {
    // Check for categories
    const foundCategory = CATEGORIES.find(c => 
      text.includes(c.name.toLowerCase()) || 
      c.keywords.some(k => text.includes(k))
    );

    if (foundCategory) {
      onCategoryChange(foundCategory.id);
      return;
    }

    if (text.includes('refresh') || text.includes('update') || text.includes('reload')) {
        onRefresh();
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      {transcript && (
          <span className="hidden md:inline-block text-xs text-red-500 animate-pulse font-mono bg-red-900/10 px-2 py-1 rounded">
              {transcript}
          </span>
      )}
      <button
        onClick={toggleListening}
        className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
          isListening 
            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.7)] scale-110' 
            : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
        }`}
        title="Voice Control (e.g., 'Show me Tech', 'Refresh')"
      >
        {isListening ? (
            <>
                <Mic className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
            </>
        ) : (
            <MicOff className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default VoiceControl;