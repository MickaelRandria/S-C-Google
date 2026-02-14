import React, { useState } from 'react';
import { GameMode, QcmCategory } from '../types';
import Button from './Button';
import Card from './Card';
import { Trophy, ArrowLeft, Check, Play, Users, Smartphone, Heart, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

interface HomeScreenProps {
  onStartSolo: (mode: GameMode, categories: string[]) => void;
  onHostGame: () => void;
  onJoinGame: () => void;
  lastScore: number | null;
}

const QCM_CATEGORIES: QcmCategory[] = ['Musique Perso', 'Amour & Séries', 'Sport & Love', 'Culture G Spéciale', 'Musique Générale'];

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartSolo, onHostGame, onJoinGame, lastScore }) => {
  const [view, setView] = useState<'main' | 'solo_config'>('main');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const isOnline = isSupabaseConfigured();

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleStartSolo = () => {
    onStartSolo('qcm', selectedCats);
  };

  const renderMainParams = () => (
    <div className="space-y-4 w-full">
       <Card className="w-full space-y-4 !bg-white/40">
            <Button 
              variant="primary" 
              fullWidth 
              size="lg"
              onClick={onHostGame}
              disabled={!isOnline}
              className="group relative overflow-hidden !justify-start px-6 shadow-xl shadow-[#E85D75]/10"
            >
              <div className="p-2 bg-white/20 rounded-xl mr-4">
                 <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-white text-lg leading-none">Créer une partie</span>
                <span className="text-xs text-rose-100 font-medium">Mode Multijoueur (Host)</span>
              </div>
              {!isOnline && <span className="absolute right-4 text-xs bg-red-500 text-white px-2 py-1 rounded">Hors-ligne</span>}
            </Button>

            <Button 
              variant="glass" 
              fullWidth 
              size="lg"
              onClick={onJoinGame}
              disabled={!isOnline}
              className="group relative overflow-hidden !justify-start px-6 bg-white/70 hover:bg-white/90 shadow-sm hover:shadow-md border-rose-100/50"
            >
               <div className="p-2 bg-rose-100 rounded-xl mr-4 shadow-sm">
                <Smartphone className="w-6 h-6 text-[#E85D75]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-[#2D1B2E] text-lg leading-none">Rejoindre</span>
                <span className="text-xs text-slate-500 font-medium">Scanner ou entrer un code</span>
              </div>
            </Button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-rose-300/30"></div>
                <span className="flex-shrink-0 mx-4 text-rose-400 text-xs uppercase font-bold tracking-widest">Ou jouer seul</span>
                <div className="flex-grow border-t border-rose-300/30"></div>
            </div>

            <Button 
              variant="glass" 
              fullWidth 
              size="lg"
              onClick={() => setView('solo_config')}
              className="!justify-start px-6 bg-white/50 border-rose-100/50"
            >
              <div className="p-2 bg-rose-100 rounded-xl mr-4 shadow-sm">
                <Play className="w-6 h-6 text-[#E85D75]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-[#2D1B2E] text-lg leading-none">Mode Solo</span>
                <span className="text-xs text-slate-500 font-medium">Lancer un quiz rapide</span>
              </div>
            </Button>
       </Card>
       
       {lastScore !== null && (
         <Card className="!bg-white/50 border-rose-100 text-center py-4">
           <div className="flex items-center justify-center gap-2 text-rose-500 font-bold">
             <Trophy className="w-5 h-5" /> Dernier score : {lastScore} pts
           </div>
         </Card>
       )}
    </div>
  );

  const renderSoloConfig = () => {
    return (
      <div className="space-y-6 w-full">
        <Button variant="ghost" size="sm" onClick={() => setView('main')} className="!justify-start px-0 text-rose-400">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[#2D1B2E]">Catégories</h2>
          <p className="text-sm text-slate-500">Sélectionnez vos thèmes favoris</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {QCM_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                selectedCats.includes(cat) 
                ? 'bg-rose-50 border-rose-500 text-rose-700' 
                : 'bg-white/50 border-rose-100 text-slate-600 hover:border-rose-200'
              }`}
            >
              <span className="font-bold">{cat}</span>
              {selectedCats.includes(cat) && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          size="lg" 
          onClick={handleStartSolo}
          disabled={selectedCats.length === 0}
          className="shadow-xl shadow-rose-500/20"
        >
          C'est parti !
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 max-w-md mx-auto relative z-10 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-sm mb-2">
          <Heart className="w-12 h-12 text-[#E85D75] fill-[#E85D75]/20 animate-pulse-heart" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter">
          <span className="text-[#2D1B2E]">Sauce &</span><br/>
          <span className="text-[#E85D75]">Curious</span>
        </h1>
        <p className="text-rose-400 font-bold text-sm uppercase tracking-widest">Édition Saint-Valentin 💘</p>
        <p className="text-slate-500 font-medium text-sm max-w-[280px] mx-auto">Le quiz ultime pour tester votre connexion et vos goûts !</p>
      </div>

      {view === 'main' && renderMainParams()}
      {view === 'solo_config' && renderSoloConfig()}
      
      <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mt-4
          ${isOnline ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}
        `}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Cloud Sync' : 'Mode Local'}
      </div>
    </div>
  );
};

export default HomeScreen;