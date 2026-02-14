import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import Card from './Card';
import Button from './Button';
import { Search, UserCheck, AlertCircle, Heart } from 'lucide-react';

interface ImposteurGameProps {
  isHost: boolean;
  players: Player[];
  gameCode: string;
  onFinish: (winnerId: string | null) => void;
}

const IMPOSTOR_WORDS = [
  { normal: "Restaurant", impostor: "Cuisine" },
  { normal: "Bague", impostor: "Bracelet" },
  { normal: "Baiser", impostor: "Câlin" },
  { normal: "Mariage", impostor: "Fiançailles" },
  { normal: "Plage", impostor: "Piscine" },
  { normal: "Rose", impostor: "Tulipe" },
  { normal: "Chocolat", impostor: "Bonbon" },
  { normal: "Film romantique", impostor: "Comédie" },
  { normal: "Saint-Valentin", impostor: "Anniversaire" },
  { normal: "Lettre d'amour", impostor: "SMS" },
];

const ImposteurGame: React.FC<ImposteurGameProps> = ({ isHost, players, gameCode, onFinish }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'voting' | 'result'>('setup');
  const [myWord, setMyWord] = useState<string | null>(null);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // Pour cet exercice, on va simplifier la synchro via Channel Supabase dans l'App.tsx
  // Mais ici on gère l'UI locale du mini-jeu.

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-6 animate-fade-in max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-rose-100 rounded-full mb-2">
          <Search className="w-8 h-8 text-[#E85D75]" />
        </div>
        <h1 className="text-3xl font-black text-[#2D1B2E] tracking-tighter">L'IMPOSTEUR 🕵️</h1>
        <p className="text-sm text-slate-500 font-medium">Un mot, un intrus. Qui bluffe ?</p>
      </div>

      <Card className="w-full text-center space-y-4 !bg-white/60">
        {isHost && phase === 'setup' && (
          <div className="space-y-4 py-4">
             <p className="text-sm text-slate-600">Le Maître du Jeu distribue les rôles oralement ou via l'app...</p>
             <Button variant="primary" fullWidth onClick={() => setPhase('playing')}>Distribuer les mots</Button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-6 py-4">
            <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">Ton mot secret</span>
              <span className="text-3xl font-black text-[#E85D75]">Restaurant</span>
            </div>
            <p className="text-sm text-slate-500 italic">"Chacun votre tour, dites UN mot lié à votre mot secret."</p>
            {isHost && <Button variant="secondary" fullWidth onClick={() => setPhase('voting')}>Lancer le vote</Button>}
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-4 py-4">
            <h3 className="font-bold text-slate-800">Qui est l'imposteur ?</h3>
            <div className="grid grid-cols-1 gap-2">
              {players.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setVoteSubmitted(true)}
                  disabled={voteSubmitted}
                  className={`p-3 rounded-xl border-2 font-bold transition-all ${voteSubmitted ? 'opacity-50' : 'border-rose-100 hover:border-rose-400'}`}
                >
                  {p.avatar} {p.name}
                </button>
              ))}
            </div>
            {voteSubmitted && <p className="text-xs text-emerald-600 font-bold">Vote envoyé ! ✅</p>}
            {isHost && <Button variant="primary" fullWidth className="mt-4" onClick={() => onFinish(null)}>Voir les résultats</Button>}
          </div>
        )}
      </Card>
      
      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest">
        <AlertCircle className="w-4 h-4" /> Jeu Social - Parlez entre vous !
      </div>
    </div>
  );
};

export default ImposteurGame;