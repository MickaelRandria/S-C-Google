import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import Button from './Button';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { CheckCircle2, XCircle, ArrowRight, Info, Timer, ArrowLeft, Check, X, Users } from 'lucide-react';

interface QuizScreenProps {
  data: Question;
  currentNumber: number;
  total: number;
  onAnswer: (isCorrect: boolean, selectedIndex?: number) => void;
  onNext: () => void;
  onBack: () => void;
  isHost?: boolean;
  correctPlayers?: string[];
  wrongPlayers?: string[];
  answeredCount?: number;
  totalPlayers?: number;
}

const TIME_LIMIT = 20;

const QuizScreen: React.FC<QuizScreenProps> = ({ 
  data, currentNumber, total, onAnswer, onNext, onBack, isHost = false, 
  correctPlayers = [], wrongPlayers = [], answeredCount = 0, totalPlayers = 0 
}) => {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!data) return;

    setSelectedOpt(null);
    setIsRevealed(false);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { handleTimeout(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [data?.id]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRevealed(true);
    if (!isHost && selectedOpt === null) onAnswer(false);
  };

  const handleSelect = (index: number) => {
    if (isRevealed || isHost) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOpt(index);
    setIsRevealed(true);
    onAnswer(index === data.ok, index);
  };

  if (!data) return null;

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 space-y-6 relative z-10">
      <div className="flex items-center justify-between text-rose-500 font-bold text-xs uppercase tracking-widest">
        <button onClick={onBack} className="flex items-center gap-1 hover:opacity-70"><ArrowLeft className="w-4 h-4" /> Quitter</button>
        <span className="bg-rose-100 px-3 py-1 rounded-full">{data.category}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-2xl font-black text-[#E85D75]">{currentNumber}<span className="text-sm text-rose-300">/{total}</span></span>
          {isHost && (
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Users className="w-4 h-4" /> RÉPONSES : {answeredCount}/{totalPlayers}
            </div>
          )}
        </div>
        <ProgressBar current={currentNumber} total={total} />
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8 py-4">
        <div className="text-center space-y-6">
          <div className={`text-4xl font-black font-mono transition-colors ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-rose-500'}`}>
            {timeLeft}s
          </div>
          <h2 className="text-2xl font-bold leading-tight text-[#2D1B2E] px-4">{data.q}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {data.opts.map((opt, idx) => {
            const isCorrect = idx === data.ok;
            const isSelected = idx === selectedOpt;
            let variant: any = 'glass';
            if (isRevealed) {
              if (isCorrect) variant = 'success';
              else if (isSelected) variant = 'danger';
            }

            return (
              <Button
                key={idx}
                variant={variant}
                onClick={() => handleSelect(idx)}
                disabled={isRevealed || isHost}
                className={`h-auto min-h-[4.5rem] py-4 px-6 text-left justify-between border-rose-100/50 ${isRevealed && !isCorrect && !isSelected ? 'opacity-40 scale-95' : ''}`}
              >
                <span className="font-bold text-lg">{opt}</span>
                {isRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                {isRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0" />}
              </Button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="animate-fade-in-up space-y-4">
            {isHost && (
              <Card className="!bg-white/80 p-4 border-emerald-100">
                <div className="space-y-3">
                   {correctPlayers.length > 0 && <div className="flex flex-wrap gap-2 items-center"><Check className="text-emerald-500 w-4 h-4" /> {correctPlayers.map(n => <span key={n} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{n}</span>)}</div>}
                   {wrongPlayers.length > 0 && <div className="flex flex-wrap gap-2 items-center"><X className="text-rose-500 w-4 h-4" /> {wrongPlayers.map(n => <span key={n} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{n}</span>)}</div>}
                </div>
              </Card>
            )}
            <Card className="!bg-rose-50/80 border-rose-200 p-4">
              <p className="text-sm leading-relaxed text-slate-700 italic">“{data.explanation}”</p>
            </Card>
          </div>
        )}
      </div>

      {(isHost || isRevealed) && (
        <Button variant="primary" fullWidth size="lg" onClick={onNext} className="animate-bounce-slight shadow-xl shadow-rose-500/30">
          Question Suivante <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default QuizScreen;