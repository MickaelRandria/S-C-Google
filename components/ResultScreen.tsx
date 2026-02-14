import React, { useState, useEffect } from 'react';
import Button from './Button';
import Card from './Card';
import { Heart, RefreshCcw, Share2, Trophy, ArrowLeft, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../supabaseClient';
import { Player } from '../types';

interface ResultScreenProps {
  score: number;
  maxScore: number;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, maxScore, onRestart }) => {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#E85D75', '#FF8FA3', '#FFD700'] });
    
    // Fetch final leaderboard
    const fetchScores = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        const { data } = await supabase.from('players').select('*').eq('game_code', code).order('score', { ascending: false });
        if (data) setLeaderboard(data);
      }
    };
    fetchScores();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-md mx-auto p-6 space-y-10 animate-fade-in relative z-10 pt-16">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" onClick={onRestart} className="text-rose-400 font-bold"><ArrowLeft className="w-4 h-4 mr-1" /> Menu</Button>
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-400/20 blur-3xl rounded-full scale-150" />
          <Heart className="w-24 h-24 text-rose-500 relative z-10 animate-pulse-heart fill-rose-500/10" />
        </div>
        <h1 className="text-4xl font-black text-[#E85D75] tracking-tighter uppercase">Fini ! 💘</h1>
        <p className="text-slate-600 font-medium">L'amour a parlé, les scores sont là.</p>
      </div>

      {leaderboard.length > 0 && (
        <Card className="w-full space-y-4 !bg-white/60">
           <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest border-b border-rose-100 pb-2">
             <Trophy className="w-4 h-4" /> Classement Final
           </div>
           <div className="space-y-2">
             {leaderboard.map((p, i) => (
               <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white/50 border border-rose-50'}`}>
                 <div className="flex items-center gap-3">
                    <span className="text-xl w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">{p.avatar}</span>
                    <span className="font-bold text-slate-800">{p.name}</span>
                 </div>
                 <span className="font-black text-rose-500">{p.score}<span className="text-[10px] text-rose-300 ml-0.5">PTS</span></span>
               </div>
             ))}
           </div>
        </Card>
      )}

      <div className="w-full space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={onRestart} className="shadow-2xl shadow-rose-500/20">
          <RefreshCcw className="w-5 h-5 mr-2" /> Rejouer
        </Button>
        <Button variant="glass" fullWidth className="border-rose-100/50">
          <Share2 className="w-5 h-5 mr-2" /> Partager les résultats
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;