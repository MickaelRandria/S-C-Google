import React from 'react';
import { Heart } from 'lucide-react';
import Button from './Button';

interface CategoryAnnounceProps {
  category: string;
  isHost: boolean;
  onStart: () => void;
}

const CATEGORY_MAP: Record<string, { emoji: string; title: string }> = {
  'Musique Perso': { emoji: '🎧', title: 'Musique Perso' },
  'Amour & Séries': { emoji: '🎬', title: 'Amour & Séries' },
  'Sport & Love': { emoji: '⚽', title: 'Sport & Love' },
  'Culture G Spéciale': { emoji: '🧠', title: 'Culture G Spéciale' },
  'Musique Générale': { emoji: '🎵', title: 'Musique Générale' },
};

const CategoryAnnounce: React.FC<CategoryAnnounceProps> = ({ category, isHost, onStart }) => {
  const info = CATEGORY_MAP[category] || { emoji: '💖', title: category };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fade-in space-y-8">
      <div className="relative">
         <div className="absolute inset-0 bg-rose-400/20 blur-3xl rounded-full scale-150" />
         <div className="text-8xl relative z-10 animate-float drop-shadow-2xl">{info.emoji}</div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-[#E85D75] tracking-tighter uppercase">{info.title}</h1>
        <p className="text-xl text-rose-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 fill-rose-400" /> Prochain Round : 5 Questions
        </p>
      </div>

      <div className="w-full max-w-xs pt-8">
        {isHost ? (
          <Button variant="primary" fullWidth size="lg" onClick={onStart} className="shadow-2xl shadow-rose-500/30">
            C'est parti ! ➡️
          </Button>
        ) : (
          <p className="text-slate-500 font-medium animate-pulse">Le Maître du Jeu s'apprête à lancer...</p>
        )}
      </div>
    </div>
  );
};

export default CategoryAnnounce;