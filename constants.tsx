import { Category } from './types';
import { AlertTriangle, Cpu, Leaf, Gavel, Zap, GraduationCap, DollarSign, Activity, Globe, Flame } from 'lucide-react';
import React from 'react';

export const CATEGORIES: Category[] = [
  { 
    id: 'catastrophe', 
    name: 'Catastrophes', 
    icon: 'AlertTriangle', 
    keywords: ['accident', 'disaster', 'crash', 'explosion', 'tragedy', 'fire', 'collapse'],
    color: 'red'
  },
  { 
    id: 'technology', 
    name: 'Tech & AI', 
    icon: 'Cpu', 
    keywords: ['AI', 'cyber', 'tech', 'innovation', 'breach', 'hacking', 'robotics'],
    color: 'cyan'
  },
  { 
    id: 'environment', 
    name: 'Environment', 
    icon: 'Leaf', 
    keywords: ['climate', 'weather', 'earthquake', 'storm', 'pollution', 'flood', 'wildfire'],
    color: 'emerald'
  },
  { 
    id: 'corruption', 
    name: 'Politics', 
    icon: 'Gavel', 
    keywords: ['scandal', 'bribe', 'corruption', 'government', 'protest', 'regime', 'dictator', 'oppression', 'law'],
    color: 'amber'
  },
  { 
    id: 'war', 
    name: 'Conflict', 
    icon: 'Flame', 
    keywords: ['war', 'conflict', 'treaty', 'border', 'military', 'army', 'weapon'],
    color: 'orange'
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: 'GraduationCap', 
    keywords: ['school', 'university', 'education', 'literacy', 'funding', 'students', 'crisis'],
    color: 'violet'
  },
  { 
    id: 'economy', 
    name: 'Economy', 
    icon: 'DollarSign', 
    keywords: ['market', 'crash', 'inflation', 'economy', 'bank', 'stock', 'trade'],
    color: 'blue'
  },
];

export const getIcon = (iconName: string, className?: string) => {
  const props = { className };
  switch (iconName) {
    case 'AlertTriangle': return <AlertTriangle {...props} />;
    case 'Cpu': return <Cpu {...props} />;
    case 'Leaf': return <Leaf {...props} />;
    case 'Gavel': return <Gavel {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'GraduationCap': return <GraduationCap {...props} />;
    case 'DollarSign': return <DollarSign {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Flame': return <Flame {...props} />;
    default: return <Activity {...props} />;
  }
};

export const PLACEHOLDER_IMAGES: Record<string, string> = {
  catastrophe: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80',
  technology: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  environment: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  corruption: 'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=800&q=80',
  war: 'https://images.unsplash.com/photo-1555502758-a537f002f23b?w=800&q=80',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  economy: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&q=80',
};
