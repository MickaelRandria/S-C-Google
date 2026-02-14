import React, { useEffect } from 'react';
import Button from './Button';
import Card from './Card';
import { Heart, RefreshCcw, Share2, Star, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultScreenProps {
  score: number;
  maxScore: number;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, maxScore, onRestart }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E85D75', '#FF8FA3', '#FFD700', '#FF6B8A', '#FFC0CB']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E85D75', '#FF8FA3', '#FFD700', '#FF6B8A', '#FFC0CB']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [percentage]);

  const getMessage = () => {
    if (percentage >= 80) return { title: "Love Guru Absolu !", text: "Vous êtes les rois de l'amour et de la culture !", color: "text-rose-500" };
    if (percentage >= 60) return { title: "Couple Goals !", text: "Impressionnant, vous vibrez ensemble !", color: "text-[#E85D75]" };
    if (percentage >= 40) return { title: "Pas Mal du Tout !", text: "L'amour est dans le quiz !", color: "text-amber-500" };
    if (percentage >= 20) return { title: "C'est l'intention qui compte 💕", text: "L'amour rend aveugle... même aux réponses ?", color: "text-orange-500" };
    return { title: "Aïe... mais on vous aime quand même 💔", text: "Heureusement qu'on ne note pas l'amour !", color: "text-rose-400" };
  };

  const msg = getMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-md mx-auto p-6 space-y-8 animate-fade-in relative z-10">
      <div className="absolute top-4 left-6">
        <Button variant="ghost" size="sm" onClick={onRestart} className="!px-2 text-rose-400">
           <ArrowLeft className="w-5 h-5" /> Menu
        </Button>
      </div>

      <div className="relative mt-8">
        <div className="absolute inset-0 bg-rose-400/20 blur-3xl rounded-full" />
        <Heart className="w-24 h-24 text-rose-500 drop-shadow-lg relative z-10 animate-pulse-heart fill-rose-500/20" />
      </div>

      <div className="text-center space-y-2 z-10">
        <h1 className={`text-4xl font-extrabold ${msg.color}`}>
          {msg.title}
        </h1>
        <p className="text-slate-600 text-lg font-medium">
          {msg.text}
        </p>
      </div>

      {maxScore > 0 && (
        <Card className="w-full text-center space-y-2 bg-white/50 border-rose-100/50">
          <div className="text-rose-400 text-sm uppercase tracking-widest font-bold">Points d'Amour</div>
          <div className="text-6xl font-black text-[#2D1B2E] tracking-tight">
            {score}
            <span className="text-2xl text-rose-300 font-medium">/{maxScore}</span>
          </div>
        </Card>
      )}

      <div className="w-full space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={onRestart}>
          <RefreshCcw className="w-5 h-5 mr-2" /> Rejouer
        </Button>
        <Button variant="glass" fullWidth onClick={() => alert("Célébrez ça ensemble ! ❤️")}>
          <Share2 className="w-5 h-5 mr-2" /> Partager la vibe
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;