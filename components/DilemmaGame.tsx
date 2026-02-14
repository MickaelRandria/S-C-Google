import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { Scale, Loader2, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface DilemmaGameProps {
  isHost: boolean;
  gameCode: string;
  playerId: string;
  onFinish: () => void;
}

const DILEMMAS = [
  {
    question: "Ton/ta partenaire peut connaitre TOUT ce que tu penses de lui/elle depuis le début (le bon ET le mauvais). C'est ok ?",
    optionA: "Oui, transparence totale 🔓",
    optionB: "Non, y'a des choses qu'il vaut mieux ignorer 🙈"
  },
  {
    question: "Tu peux revivre votre premier rendez-vous, mais tu oublies tout ce que vous avez vécu depuis. Tu le fais ?",
    optionA: "Oui, je veux retrouver ces papillons 🦋",
    optionB: "Non, je ne sacrifie pas nos souvenirs 💝"
  },
  {
    question: "Ton/ta partenaire a un(e) meilleur(e) ami(e) qui le/la connait mieux que toi sur certains sujets. Ça te dérange ?",
    optionA: "Oui, je devrais être son n°1 en tout 😤",
    optionB: "Non, c'est impossible d'être expert en tout 🤷"
  },
  {
    question: "On vous offre une maison de rêve, mais vous ne pouvez jamais voyager ensemble. Vous acceptez ?",
    optionA: "On prend la maison ! 🏡",
    optionB: "Jamais, les voyages c'est sacré ✈️"
  },
  {
    question: "Tu apprends que ton/ta partenaire a menti sur un détail insignifiant il y a 3 ans. Tu en fais quoi ?",
    optionA: "C'est rien, j'oublie 😌",
    optionB: "Si il/elle a menti sur ça, sur quoi d'autre ? 🤔"
  }
];

const DilemmaGame: React.FC<DilemmaGameProps> = ({ isHost, gameCode, playerId, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');
  const [votedChoice, setVotedChoice] = useState<'A' | 'B' | null>(null);
  const [stats, setStats] = useState({ a: 50, b: 50 });

  useEffect(() => {
    const channel = supabase
      .channel(`dilemma_sync_${gameCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${gameCode}` }, (payload) => {
        const newData = payload.new;
        setIndex(newData.question_index || 0);
        setPhase(newData.minigame_phase as any || 'playing');
        if (newData.minigame_phase === 'playing') setVotedChoice(null);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameCode]);

  useEffect(() => {
    if (phase === 'results') {
      const fetchStats = async () => {
        const { data } = await supabase
          .from('minigame_state')
          .select('data')
          .eq('game_code', gameCode)
          .eq('data->index', index);
        
        if (data && data.length > 0) {
          const aCount = data.filter(d => d.data.choice === 'A').length;
          const bCount = data.filter(d => d.data.choice === 'B').length;
          const total = aCount + bCount;
          if (total > 0) {
            setStats({ a: Math.round((aCount / total) * 100), b: Math.round((bCount / total) * 100) });
          }
        }
      };
      fetchStats();
    }
  }, [phase, gameCode, index]);

  const handleVote = async (choice: 'A' | 'B') => {
    if (votedChoice) return;
    setVotedChoice(choice);
    await supabase.from('minigame_state').insert({
      game_code: gameCode,
      player_id: playerId,
      player_name: 'Dilemma Voter',
      data: { index, choice }
    });
  };

  const updateHostPhase = async (p: string) => {
    await supabase.from('games').update({ minigame_phase: p }).eq('code', gameCode);
  };

  const nextDilemma = async () => {
    if (index < DILEMMAS.length - 1) {
      await supabase.from('games').update({ 
        question_index: index + 1, 
        minigame_phase: 'playing' 
      }).eq('code', gameCode);
    } else {
      onFinish();
    }
  };

  const d = DILEMMAS[index];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-8 animate-fade-in max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-rose-100 rounded-full mb-2">
          <Scale className="w-8 h-8 text-[#E85D75]" />
        </div>
        <h1 className="text-3xl font-black text-[#2D1B2E] tracking-tighter uppercase">DILEMME EXPRESS ⚡</h1>
        <p className="text-rose-400 font-bold text-xs uppercase tracking-widest">{index + 1} / {DILEMMAS.length}</p>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-rose-200/50 text-center font-bold text-slate-800 text-lg shadow-sm italic leading-relaxed animate-fade-in-up">
           "{d.question}"
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant={votedChoice === 'A' ? 'primary' : 'glass'} 
            fullWidth 
            size="lg" 
            className={`h-24 !justify-center flex-col transition-all duration-300 ${phase === 'results' && votedChoice !== 'A' ? 'opacity-40' : ''}`}
            onClick={() => handleVote('A')}
            disabled={!!votedChoice || phase === 'results'}
          >
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Option A</span>
            <span className="font-bold text-sm sm:text-base">{d.optionA}</span>
          </Button>

          <Button 
            variant={votedChoice === 'B' ? 'primary' : 'glass'} 
            fullWidth 
            size="lg" 
            className={`h-24 !justify-center flex-col transition-all duration-300 ${phase === 'results' && votedChoice !== 'B' ? 'opacity-40' : ''}`}
            onClick={() => handleVote('B')}
            disabled={!!votedChoice || phase === 'results'}
          >
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Option B</span>
            <span className="font-bold text-sm sm:text-base">{d.optionB}</span>
          </Button>
        </div>

        {isHost && phase === 'playing' && (
          <Button variant="secondary" fullWidth onClick={() => updateHostPhase('results')} className="mt-4 border-rose-200">
            Voir les tendances <Users className="w-4 h-4 ml-2" />
          </Button>
        )}

        {phase === 'results' && (
          <div className="animate-fade-in space-y-6 pt-4">
             <div className="bg-white/40 p-6 rounded-3xl border border-rose-100 flex items-center justify-center gap-8 shadow-inner">
                <div className="text-center">
                   <div className="text-4xl font-black text-rose-500">{stats.a}%</div>
                   <div className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Team A</div>
                </div>
                <div className="w-px h-12 bg-rose-100" />
                <div className="text-center">
                   <div className="text-4xl font-black text-slate-400">{stats.b}%</div>
                   <div className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Team B</div>
                </div>
             </div>
             {isHost && (
               <Button variant="primary" fullWidth onClick={nextDilemma} className="animate-bounce-slight shadow-xl shadow-rose-500/20">
                 {index < DILEMMAS.length - 1 ? 'Dilemme Suivant ➡️' : 'Reprendre le Quiz 💘'}
               </Button>
             )}
          </div>
        )}

        {phase === 'playing' && !isHost && !votedChoice && (
          <div className="flex items-center justify-center gap-2 text-rose-300 text-[10px] font-bold uppercase animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> En attente de ton choix...
          </div>
        )}
      </div>
    </div>
  );
};

export default DilemmaGame;