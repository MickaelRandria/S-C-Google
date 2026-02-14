
import React, { useState } from 'react';
import { GameMode, QcmCategory, DebateCategory } from '../types';
import Button from './Button';
import Card from './Card';
import { Flame, MessageCircle, Trophy, ArrowLeft, Check, Play, Users, Smartphone, Heart, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

interface HomeScreenProps {
  onStartSolo: (mode: GameMode, categories: string[]) => void;
  onHostGame: () => void;
  onJoinGame: () => void;
  lastScore: number | null;
}

const QCM_CATEGORIES: QcmCategory[] = ['Musique Perso', 'Amour & Séries', 'Sport & Love', 'Culture G Spéciale', 'Musique Générale'];
const DEBATE_CATEGORIES: DebateCategory[] = ['Couple', 'Relation', 'Intimité', 'Futur'];

/**
 * HomeScreen component provides the main menu of the game.
 * It allows starting a solo game, hosting a multiplayer game, or joining an existing one.
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ onStartSolo, onHostGame, onJoinGame, lastScore }) => {
  const [view, setView] = useState<'main' | 'solo_mode' | 'solo_config'>('main');
  const [selectedSoloMode, setSelectedSoloMode] = useState<GameMode | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const isOnline = isSupabaseConfigured();

  const handleSoloModeSelect = (mode: GameMode) => {
    setSelectedSoloMode(mode);
    if (mode === 'mixte') {
      onStartSolo('mixte', []);
    } else {
      setView('solo_config');
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleStartSolo = () => {
    if (selectedSoloMode) {
      onStartSolo(selectedSoloMode, selectedCats);
    }
  };

  // Main menu parameters (Multiplayer Create/Join and Solo)
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
              <div className="flex flex-col items-start">
                <span className="font-bold text-white text-lg">Créer une partie</span>
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
              <div className="flex flex-col items-start">
                <span className="font-bold text-[#2D1B2E] text-lg">Rejoindre</span>
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
              onClick={() => setView('solo_mode')}
              className="!justify-start px-6 bg-white/50 border-rose-100/50"
            >
              <div className="p-2 bg-rose-100 rounded-xl mr-4 shadow-sm">
                <Play className="w-6 h-6 text-[#E85D75]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-[#2D1B2E] text-lg">Mode Solo</span>
                <span className="text-xs text-slate-500 font-medium">S'entraîner tranquillement</span>
              </div>
            </Button>
       </Card>
       
       {lastScore !== null && (
         <Card className="!bg-emerald-50/50 border-emerald-100 text-center py-4">
           <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
             <Trophy className="w-5 h-5" /> Dernier score : {lastScore} pts
           </div>
         </Card>
       )}
    </div>
  );

  // Solo mode selection view
  const renderSoloModes = () => (
    <div className="grid grid-cols-1 gap-4 w-full">
      <Button variant="ghost" size="sm" onClick={() => setView('main')} className="!justify-start px-0 text-rose-400 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Button>
      <h2 className="text-2xl font-bold text-center mb-4 text-[#2D1B2E]">Mode Solo</h2>
      <div className="grid grid-cols-1 gap-4">
        <Button variant="glass" fullWidth size="lg" onClick={() => handleSoloModeSelect('qcm')} className="h-24 !justify-center">
           <div className="flex flex-col items-center">
             <Flame className="w-6 h-6 text-rose-500 mb-1" />
             <span className="font-bold text-lg">Questions (QCM)</span>
           </div>
        </Button>
        <Button variant="glass" fullWidth size="lg" onClick={() => handleSoloModeSelect('debate')} className="h-24 !justify-center">
           <div className="flex flex-col items-center">
             <MessageCircle className="w-6 h-6 text-rose-500 mb-1" />
             <span className="font-bold text-lg">Débats</span>
           </div>
        </Button>
        <Button variant="primary" fullWidth size="lg" onClick={() => handleSoloModeSelect('mixte')} className="h-24 !justify-center">
           <div className="flex flex-col items-center text-white">
             <Heart className="w-6 h-6 mb-1" />
             <span className="font-bold text-lg">Mélange Mixte</span>
           </div>
        </Button>
      </div>
    </div>
  );

  // Solo configuration view for selecting categories
  const renderSoloConfig = () => {
    const categories = selectedSoloMode === 'qcm' ? QCM_CATEGORIES : DEBATE_CATEGORIES;
    return (
      <div className="space-y-6 w-full">
        <Button variant="ghost" size="sm" onClick={() => setView('solo_mode')} className="!justify-start px-0 text-rose-400">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[#2D1B2E]">Catégories</h2>
          <p className="text-sm text-slate-500">Sélectionnez vos thèmes favoris</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {categories.map(cat => (
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

  // Main render logic based on the current view state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 max-w-md mx-auto relative z-10 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-sm mb-2">
          <Heart className="w-12 h-12 text-[#E85D75] fill-[#E85D75]/20 animate-pulse-heart" />
        </div>
        <h1 className="text-5xl font-black text-[#2D1B2E] tracking-tighter">
          COUPLE<span className="text-[#E85D75]">VIBE</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-[250px] mx-auto">Le quiz ultime pour tester votre connexion et vos goûts !</p>
      </div>

      {view === 'main' && renderMainParams()}
      {view === 'solo_mode' && renderSoloModes()}
      {view === 'solo_config' && renderSoloConfig()}
    </div>
  );
};

export default HomeScreen;
