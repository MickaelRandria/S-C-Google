import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import Card from './Card';
import Button from './Button';
import { Check, User, Loader2, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface TruthLieGameProps {
  isHost: boolean;
  players: Player[];
  gameCode: string;
  playerId: string;
  playerName: string;
  onFinish: () => void;
}

const TruthLieGame: React.FC<TruthLieGameProps> = ({ isHost, players, gameCode, playerId, playerName, onFinish }) => {
  const [phase, setPhase] = useState<'setup' | 'writing' | 'voting' | 'reveal'>('setup');
  const [activePlayer, setActivePlayer] = useState<{ id: string, name: string } | null>(null);
  const [facts, setFacts] = useState<string[]>(['', '', '']);
  const [lieIdx, setLieIdx] = useState<number | null>(null);
  const [submittedFacts, setSubmittedFacts] = useState<string[]>([]);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [correctLieIndex, setCorrectLieIndex] = useState<number | null>(null);

  // Sync phase and active player
  useEffect(() => {
    const fetchCurrentState = async () => {
      const { data: gData } = await supabase.from('games').select('minigame_phase').eq('code', gameCode).single();
      if (gData) setPhase(gData.minigame_phase as any || 'setup');

      const { data: sData } = await supabase.from('minigame_state').select('*').eq('game_code', gameCode).single();
      if (sData) {
        setActivePlayer({ id: sData.player_id, name: sData.player_name });
        setSubmittedFacts(sData.data.facts || []);
        if (gData?.minigame_phase === 'reveal') setCorrectLieIndex(sData.data.lieIndex);
      }
    };
    fetchCurrentState();

    const channel = supabase
      .channel(`truthlie_sync_${gameCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${gameCode}` }, (payload) => {
        setPhase(payload.new.minigame_phase as any || 'setup');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'minigame_state', filter: `game_code=eq.${gameCode}` }, (payload) => {
        setActivePlayer({ id: payload.new.player_id, name: payload.new.player_name });
        setSubmittedFacts(payload.new.data.facts || []);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameCode]);

  const selectRandomPlayer = async () => {
    const all = [...players, { id: 'HOST-' + gameCode, name: 'Maître du Jeu' }];
    const chosen = all[Math.floor(Math.random() * all.length)];
    
    await supabase.from('minigame_state').delete().eq('game_code', gameCode);
    await supabase.from('minigame_state').insert({
      game_code: gameCode,
      player_id: chosen.id,
      player_name: chosen.name,
      data: { phase: 'writing' }
    });
    await supabase.from('games').update({ minigame_phase: 'writing' }).eq('code', gameCode);
  };

  const submitFacts = async () => {
    if (lieIdx === null || facts.some(f => !f.trim())) {
      alert("Remplis tout et choisis ton mensonge !");
      return;
    }
    await supabase.from('minigame_state').update({
      data: { facts, lieIndex: lieIdx }
    }).eq('game_code', gameCode).eq('player_id', playerId);
    await supabase.from('games').update({ minigame_phase: 'voting' }).eq('code', gameCode);
  };

  const updatePhase = async (p: string) => {
    await supabase.from('games').update({ minigame_phase: p }).eq('code', gameCode);
  };

  const isMyTurn = activePlayer?.id === playerId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-6 animate-fade-in max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-rose-100 rounded-full mb-2">
          <User className="w-8 h-8 text-[#E85D75]" />
        </div>
        <h1 className="text-3xl font-black text-[#2D1B2E] tracking-tighter uppercase">2 VÉRITÉS 1 MENSONGE ✌️</h1>
        {activePlayer && <p className="text-sm text-slate-500 font-medium">Tour de : <span className="text-rose-500 font-bold">{isMyTurn ? "TOI !" : activePlayer.name}</span></p>}
      </div>

      <Card className="w-full space-y-4 !bg-white/60">
        {phase === 'setup' && (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-slate-600">Désignons celui qui va nous faire douter...</p>
            {isHost ? (
              <Button variant="primary" fullWidth onClick={selectRandomPlayer}>Choisir un joueur</Button>
            ) : (
              <Loader2 className="w-8 h-8 animate-spin text-rose-300 mx-auto" />
            )}
          </div>
        )}

        {phase === 'writing' && (
          <div className="space-y-4">
            {isMyTurn ? (
              <>
                <p className="text-sm text-slate-600 text-center">Écris 3 affirmations sur toi, dont 1 mensonge !</p>
                {facts.map((f, i) => (
                  <div key={i} className="relative">
                    <input 
                      type="text"
                      value={f}
                      onChange={(e) => {
                        const newF = [...facts];
                        newF[i] = e.target.value;
                        setFacts(newF);
                      }}
                      placeholder={`Affirmation ${i+1}`}
                      className="w-full p-3 pr-10 rounded-xl border border-rose-100 focus:border-rose-500 focus:outline-none bg-white/50"
                    />
                    <button 
                      onClick={() => setLieIdx(i)}
                      className={`absolute right-2 top-2 w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center font-bold text-xs ${lieIdx === i ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-50 text-rose-200'}`}
                    >
                      {lieIdx === i ? 'LIE' : '?'}
                    </button>
                  </div>
                ))}
                <Button variant="primary" fullWidth onClick={submitFacts}>
                  Prêt à bluffer <Send className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 animate-spin text-rose-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 italic">"{activePlayer?.name} est en train d'écrire ses faits..."</p>
              </div>
            )}
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-4 py-2">
             <h3 className="font-bold text-center text-slate-800">Où est le mensonge ?</h3>
             <div className="space-y-3">
               {submittedFacts.map((text, i) => (
                 <button 
                   key={i} 
                   disabled={voteSubmitted || isMyTurn}
                   onClick={() => setVoteSubmitted(true)}
                   className={`w-full p-4 text-left bg-white border border-rose-100 rounded-xl font-medium transition-all flex justify-between items-center group ${voteSubmitted ? 'opacity-50' : 'hover:border-rose-400 shadow-sm'}`}
                 >
                   <span className="text-sm leading-tight">{text}</span>
                   <span className={`w-8 h-8 rounded-full border-2 border-rose-50 flex items-center justify-center font-bold text-rose-200 group-hover:text-rose-400 ${voteSubmitted ? 'hidden' : ''}`}>?</span>
                 </button>
               ))}
             </div>
             {isMyTurn && <p className="text-xs text-rose-400 font-bold text-center italic">Ils sont en train d'essayer de te démasquer ! 😈</p>}
             {isHost && <Button variant="secondary" fullWidth onClick={() => updatePhase('reveal')}>Révéler la vérité</Button>}
          </div>
        )}

        {phase === 'reveal' && (
          <div className="space-y-6 py-2 text-center animate-scale-in">
             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <Check className="w-8 h-8 text-emerald-500" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-emerald-600 uppercase mb-4">Le Mensonge :</h3>
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-800 font-bold italic">
                  "{submittedFacts[correctLieIndex ?? -1]}"
                </div>
             </div>
             {isHost && <Button variant="primary" fullWidth onClick={onFinish}>Reprendre le Quiz 💘</Button>}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TruthLieGame;