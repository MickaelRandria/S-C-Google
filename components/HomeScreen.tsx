import React from 'react';
import { GameMode } from '../types';
import Button from './Button';
import Card from './Card';
import { Play, Users, Smartphone, Heart } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

interface HomeScreenProps {
  onStartSolo: (mode: GameMode, categories: string[]) => void;
  onHostGame: () => void;
  onJoinGame: () => void;
  lastScore: number | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartSolo, onHostGame, onJoinGame, lastScore }) => {
  const isOnline = isSupabaseConfigured();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12 max-w-md mx-auto relative z-10 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-500/10 mb-2">
          <Heart className="w-16 h-16 text-[#E85D75] fill-[#E85D75]/10 animate-pulse-heart" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
          <span className="text-[#2D1B2E]">Sauce &</span><br/>
          <span className="text-[#E85D75]">Curious</span>
        </h1>
        <p className="text-rose-400 font-bold text-sm uppercase tracking-[0.2em]">Édition Saint-Valentin 💘</p>
      </div>

      <div className="w-full space-y-4">
        <Card className="w-full space-y-4 !bg-white/40">
          <Button 
            variant="primary" 
            fullWidth 
            size="lg"
            onClick={onHostGame}
            disabled={!isOnline}
            className="!justify-start px-6 shadow-xl shadow-[#E85D75]/20 h-24"
          >
            <div className="p-3 bg-white/20 rounded-2xl mr-4"><Users className="w-7 h-7" /></div>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-lg leading-none mb-1">Créer une partie</span>
              <span className="text-xs text-rose-100 font-medium opacity-80">Jouer à plusieurs (Maître du Jeu)</span>
            </div>
          </Button>

          <Button 
            variant="glass" 
            fullWidth 
            size="lg"
            onClick={onJoinGame}
            disabled={!isOnline}
            className="!justify-start px-6 bg-white/70 h-24 border-rose-200/50"
          >
             <div className="p-3 bg-rose-100 rounded-2xl mr-4 shadow-sm"><Smartphone className="w-7 h-7 text-[#E85D75]" /></div>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-[#2D1B2E] text-lg leading-none mb-1">Rejoindre</span>
              <span className="text-xs text-slate-500 font-medium">Scanner ou entrer un code</span>
            </div>
          </Button>

          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-rose-200/30"></div>
              <span className="flex-shrink-0 mx-4 text-rose-300 text-[10px] uppercase font-bold tracking-widest">ou</span>
              <div className="flex-grow border-t border-rose-200/30"></div>
          </div>

          <Button 
            variant="glass" 
            fullWidth 
            onClick={() => onStartSolo('qcm', [])}
            className="!justify-start px-6 bg-white/40 border-rose-100/30 h-16"
          >
             <div className="p-2 bg-rose-50 rounded-xl mr-4"><Play className="w-5 h-5 text-rose-400" /></div>
             <span className="font-bold text-[#2D1B2E]">Mode Solo (Entraînement)</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;