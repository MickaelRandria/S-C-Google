import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import { ArrowLeft, Heart } from 'lucide-react';

interface JoinGameScreenProps {
  onJoin: (code: string, name: string, avatar: string) => void;
  onBack: () => void;
  initialCode?: string;
}

const PLAYERS = [
  { name: 'Mirana', img: '/mirana.png', emoji: '👸🏽' }, 
  { name: 'Nakib', img: '/nakib.png', emoji: '🤴🏽' },  
  { name: 'Mickael', img: '/mickael.png', emoji: '🤴🏾' }, 
  { name: 'Aina', img: '/aina.png', emoji: '👸🏾' },    
];

const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ onJoin, onBack, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [selectedProfile, setSelectedProfile] = useState<typeof PLAYERS[0] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 4 && selectedProfile) {
      onJoin(code.toUpperCase(), selectedProfile.name, selectedProfile.emoji);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-md mx-auto p-6 space-y-6 animate-fade-in relative z-10">
      <div className="w-full flex items-center justify-start">
        <Button variant="ghost" size="sm" onClick={onBack} className="!px-2 text-rose-400">
           <ArrowLeft className="w-5 h-5" /> Retour
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-[#2D1B2E] flex items-center justify-center gap-2">
          Rejoindre <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse-heart" />
        </h1>
        <p className="text-slate-600">Identifie-toi pour lancer la soirée !</p>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-rose-400 uppercase tracking-widest">Code de la partie</label>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] p-4 rounded-xl border-2 border-rose-100 focus:border-rose-500 focus:outline-none uppercase bg-white/50 text-[#E85D75]"
              required
            />
          </div>

          <div className="space-y-3">
             <label className="text-sm font-bold text-rose-400 uppercase tracking-widest text-center block">Qui es-tu ?</label>
             <div className="grid grid-cols-2 gap-4">
               {PLAYERS.map((profile) => {
                 const isSelected = selectedProfile?.name === profile.name;
                 return (
                   <button
                    key={profile.name}
                    type="button"
                    onClick={() => setSelectedProfile(profile)}
                    className={`
                      flex flex-col items-center p-2 rounded-2xl border-2 transition-all duration-300 overflow-hidden group
                      ${isSelected 
                        ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-500/10 scale-105 z-10' 
                        : 'bg-white/50 border-rose-100 hover:border-rose-300'}
                    `}
                   >
                     <div className="w-full aspect-square rounded-xl mb-2 overflow-hidden bg-rose-100 border border-rose-100 shadow-inner">
                        <img 
                          src={profile.img} 
                          alt={profile.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex items-center justify-center h-full text-4xl">${profile.emoji}</div>`;
                          }}
                        />
                     </div>
                     <span className={`font-black text-sm uppercase tracking-tighter ${isSelected ? 'text-rose-600' : 'text-slate-700'}`}>
                       {profile.name}
                     </span>
                   </button>
                 );
               })}
             </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            size="lg"
            disabled={code.length < 4 || !selectedProfile}
            className="shadow-xl shadow-rose-500/20"
          >
            Rejoindre la partie
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default JoinGameScreen;