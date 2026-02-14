import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from './Button';
import Card from './Card';
import { Player } from '../types';
import { Users, Play, Loader2, Heart, ArrowLeft } from 'lucide-react';

interface LobbyScreenProps {
  role: 'host' | 'player';
  gameCode: string;
  players: Player[];
  onStartGame?: () => void;
  onLeave?: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ role, gameCode, players, onStartGame, onLeave }) => {
  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);
    alert("Code d'amour copié !");
  };

  return (
    <div className="flex flex-col items-center min-h-full w-full max-w-2xl mx-auto p-6 space-y-6 animate-fade-in relative z-10">
      
      <div className="w-full flex items-center justify-start">
        <Button variant="ghost" size="sm" onClick={onLeave} className="!px-2 text-rose-400">
           <ArrowLeft className="w-5 h-5" /> Quitter
        </Button>
      </div>

      <div className="text-center space-y-2 pt-0">
        <h1 className="text-2xl font-bold text-rose-600 flex items-center gap-2 justify-center">
          <Heart className="w-6 h-6 fill-rose-600" /> Salle d'attente 💘
        </h1>
        {role === 'player' && (
          <p className="text-rose-400 animate-pulse font-medium">L'amour arrive, préparez-vous !</p>
        )}
      </div>

      <Card className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center !bg-white/40">
        
        <div className="flex flex-col items-center space-y-6 border-b md:border-b-0 md:border-r border-rose-100 pb-6 md:pb-0 md:pr-6">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-bold text-rose-300 uppercase tracking-widest">Code Secret</span>
            <button 
              onClick={copyCode}
              className="text-6xl font-black text-[#E85D75] font-mono tracking-wider hover:scale-105 transition-transform cursor-pointer active:text-[#B91C4A]"
            >
              {gameCode}
            </button>
          </div>

          {role === 'host' && (
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-rose-50">
              <QRCodeSVG value={`${window.location.origin}?code=${gameCode}`} size={160} fgColor="#E85D75" />
            </div>
          )}
        </div>

        <div className="flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500" /> Joueurs ({players.length})
            </h3>
            {players.length === 0 && (
              <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
            )}
          </div>

          <div className="flex-1 bg-white/40 rounded-2xl p-4 overflow-y-auto max-h-[300px] space-y-2 border border-rose-50 scrollbar-thin">
            {players.length === 0 ? (
              <div className="text-center text-rose-300 text-sm py-10 italic">
                En attente des couples...
              </div>
            ) : (
              players.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/70 p-3 rounded-xl shadow-sm animate-scale-in border border-rose-50">
                  <span className="text-2xl bg-rose-50 rounded-full w-10 h-10 flex items-center justify-center">{p.avatar}</span>
                  <span className="font-bold text-slate-800">{p.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <div className="w-full max-w-md space-y-3">
        {role === 'host' ? (
          <Button 
            variant="primary" 
            fullWidth 
            size="lg" 
            onClick={onStartGame}
            disabled={players.length === 0}
            className="shadow-xl shadow-rose-500/20"
          >
            Lancer le Quiz <Play className="w-5 h-5 ml-2" />
          </Button>
        ) : (
           <Button variant="ghost" fullWidth disabled className="text-rose-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> En attente du maître...
           </Button>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;