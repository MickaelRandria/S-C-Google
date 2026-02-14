import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import Card from './Card';
import Button from './Button';
import { Search, AlertCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface ImposteurGameProps {
  isHost: boolean;
  players: Player[];
  gameCode: string;
  playerId: string;
  playerName: string;
  onFinish: () => void;
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

const ImposteurGame: React.FC<ImposteurGameProps> = ({ isHost, players, gameCode, playerId, playerName, onFinish }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'voting' | 'result'>('setup');
  const [myWord, setMyWord] = useState<string | null>(null);
  const [isImpostor, setIsImpostor] = useState(false);
  const [impostorName, setImpostorName] = useState<string | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Écoute de la phase globale via le Host
  useEffect(() => {
    const channel = supabase
      .channel(`impostor_sync_${gameCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${gameCode}` }, (payload) => {
        setPhase(payload.new.minigame_phase as any || 'setup');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameCode]);

  // Récupérer son mot quand la phase passe à 'playing'
  useEffect(() => {
    if (phase === 'playing' || phase === 'voting') {
      const fetchMyRole = async () => {
        const { data } = await supabase
          .from('minigame_state')
          .select('data')
          .eq('game_code', gameCode)
          .eq('player_id', playerId)
          .maybeSingle();
        
        if (data) {
          setMyWord(data.data.word);
          setIsImpostor(data.data.isImpostor);
        }
      };
      fetchMyRole();
    }
    
    if (phase === 'result') {
      const fetchImpostor = async () => {
        const { data } = await supabase
          .from('minigame_state')
          .select('player_name')
          .eq('game_code', gameCode)
          .eq('data->isImpostor', true)
          .single();
        if (data) setImpostorName(data.player_name);
      };
      fetchImpostor();
    }
  }, [phase, gameCode, playerId]);

  const distributeWords = async () => {
    setIsLoading(true);
    const wordSet = IMPOSTOR_WORDS[Math.floor(Math.random() * IMPOSTOR_WORDS.length)];
    
    // Tous les participants (Joueurs + Host)
    const allParticipants = [...players, { id: playerId, name: playerName, avatar: '👤', score: 0, game_code: gameCode }];
    const impostorIdx = Math.floor(Math.random() * allParticipants.length);

    // Supprimer les états précédents s'ils existent
    await supabase.from('minigame_state').delete().eq('game_code', gameCode);

    const inserts = allParticipants.map((p, i) => ({
      game_code: gameCode,
      player_id: p.id,
      player_name: p.name,
      data: {
        word: i === impostorIdx ? wordSet.impostor : wordSet.normal,
        isImpostor: i === impostorIdx
      }
    }));

    await supabase.from('minigame_state').insert(inserts);
    await supabase.from('games').update({ minigame_phase: 'playing' }).eq('code', gameCode);
    setIsLoading(false);
  };

  const updatePhase = async (newPhase: string) => {
    await supabase.from('games').update({ minigame_phase: newPhase }).eq('code', gameCode);
  };

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
        {phase === 'setup' && (
          <div className="space-y-4 py-4">
             <p className="text-sm text-slate-600">Le Maître du Jeu s'apprête à distribuer les rôles...</p>
             {isHost ? (
               <Button variant="primary" fullWidth onClick={distributeWords} disabled={isLoading}>
                 {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Distribuer les rôles"}
               </Button>
             ) : (
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
                 <span className="text-xs font-bold text-rose-300 uppercase animate-pulse">Distribution en cours...</span>
               </div>
             )}
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-6 py-4">
            <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl animate-scale-in">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">Ton mot secret</span>
              <span className="text-3xl font-black text-[#E85D75]">{myWord || 'Chargement...'}</span>
            </div>
            <p className="text-sm text-slate-500 italic">"Chacun votre tour, dites UN mot lié à votre mot secret."</p>
            {isHost && <Button variant="secondary" fullWidth onClick={() => updatePhase('voting')}>Lancer le vote</Button>}
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-4 py-4">
            <h3 className="font-bold text-slate-800">Qui est l'imposteur ?</h3>
            <div className="grid grid-cols-1 gap-2">
              {[...players, { id: 'HOST-' + gameCode, name: 'Maître du Jeu', avatar: '👤' }].map(p => (
                <button 
                  key={p.id}
                  onClick={() => setVoteSubmitted(true)}
                  disabled={voteSubmitted}
                  className={`p-3 rounded-xl border-2 font-bold transition-all flex items-center justify-between ${voteSubmitted ? 'opacity-50 border-slate-100' : 'border-rose-100 hover:border-rose-400'}`}
                >
                  <span>{p.avatar} {p.name}</span>
                  {voteSubmitted && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>
            {voteSubmitted && <p className="text-xs text-emerald-600 font-bold">Vote envoyé ! ✅</p>}
            {isHost && <Button variant="primary" fullWidth className="mt-4" onClick={() => updatePhase('result')}>Dévoiler l'Imposteur</Button>}
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 py-4 animate-scale-in">
             <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <AlertCircle className="w-8 h-8 text-rose-500" />
             </div>
             <div>
               <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">L'Imposteur était :</p>
               <h2 className="text-3xl font-black text-rose-600">{impostorName || '...'}</h2>
             </div>
             {isHost && <Button variant="primary" fullWidth onClick={onFinish}>Continuer le quiz 💘</Button>}
          </div>
        )}
      </Card>
      
      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest text-center px-4">
        <AlertCircle className="w-4 h-4 shrink-0" /> Ne révélez jamais votre mot avant la fin !
      </div>
    </div>
  );
};

export default ImposteurGame;