import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import Button from './Button';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { CheckCircle2, XCircle, ArrowRight, Info, Timer, Heart, ArrowLeft, Check, X } from 'lucide-react';

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
}

const TIME_LIMIT = 15;

const QuizScreen: React.FC<QuizScreenProps> = ({ 
  data, 
  currentNumber, 
  total, 
  onAnswer, 
  onNext, 
  onBack, 
  isHost = false, 
  correctPlayers = [], 
  wrongPlayers = [] 
}) => {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSelectedOpt(null);
    setIsRevealed(false);
    setTimeLeft(TIME_LIMIT);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data.id]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRevealed(true);
    if (!isHost) onAnswer(false);
  };

  const handleSelect = (index: number) => {
    if (isRevealed || isHost) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOpt(index);
    setIsRevealed(true);
    onAnswer(index === data.ok, index);
  };

  const getButtonVariant = (index: number) => {
    if (!isRevealed) return 'glass';
    if (index === data.ok) return 'success';
    if (index === selectedOpt) return 'danger';
    return 'glass';
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Musique Perso': return 'bg-[#E85D75] text-white';
      case 'Amour & Séries': return 'bg-[#FF6B8A] text-white';
      case 'Sport & Love': return 'bg-[#D63B5C] text-white';
      case 'Culture G Spéciale': return 'bg-[#FFB5C2] text-[#7A1B3D]';
      case 'Musique Générale': return 'bg-[#FF8FA3] text-white';
      default: return 'bg-rose-500 text-white';
    }
  };

  const timerPercentage = (timeLeft / TIME_LIMIT) * 100;

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 space-y-6 relative z-10">
      <div className="w-full flex items-center justify-start -mb-2">
        <Button variant="ghost" size="xs" onClick={onBack} className="!px-2 text-rose-400">
           <ArrowLeft className="w-4 h-4" /> Quitter
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-rose-600 font-medium pt-2">
        <span>💘 Question {currentNumber} / {total}</span>
        <span className={`px-3 py-1 rounded-full shadow-sm text-xs font-bold uppercase tracking-wider ${getCategoryColor(data.category)}`}>
          {data.category}
        </span>
      </div>
      
      <div className="space-y-1">
        <ProgressBar current={currentNumber} total={total} />
        {!isRevealed && (
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-linear bg-[#E85D75]"
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center space-y-4">
           {!isRevealed ? (
             <div className={`flex items-center justify-center gap-2 text-2xl font-bold font-mono ${timeLeft < 5 ? 'text-red-500' : 'text-[#E85D75]'} transition-colors`}>
               <Timer className="w-6 h-6" />
               {timeLeft}s
             </div>
           ) : (
             <div className="h-8"></div>
           )}
          
          <h2 className="text-2xl font-bold leading-tight text-[#2D1B2E] drop-shadow-sm min-h-[4rem]">
            {data.q}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {data.opts.map((opt, idx) => (
            <Button
              key={idx}
              variant={getButtonVariant(idx)}
              onClick={() => handleSelect(idx)}
              disabled={isRevealed || isHost}
              className={`justify-between text-left h-auto min-h-[4.5rem] py-3 px-5 transition-all duration-300 border-rose-100/50
                ${isRevealed && idx !== data.ok && idx !== selectedOpt ? 'opacity-40 grayscale' : 'shadow-sm'}
                ${isHost ? 'cursor-default transform-none' : ''}
              `}
            >
              <span className={`flex-1 font-medium text-lg ${isRevealed && idx === data.ok ? 'text-white' : ''}`}>{opt}</span>
              {isRevealed && idx === data.ok && <CheckCircle2 className="w-6 h-6 ml-2 text-white" />}
              {isRevealed && idx === selectedOpt && idx !== data.ok && <XCircle className="w-6 h-6 ml-2 text-white" />}
            </Button>
          ))}
        </div>

        {isRevealed && (
          <div className="animate-fade-in-up space-y-4 pb-10">
            {isHost && (
              <Card className="!bg-white/60 border-rose-200 p-4 space-y-3">
                 <div className="flex flex-col space-y-2">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-rose-100 pb-1">Résultats du tour</div>
                    
                    {correctPlayers.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {correctPlayers.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{name}</span>
                        ))}
                      </div>
                    )}
                    
                    {wrongPlayers.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                        {wrongPlayers.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">{name}</span>
                        ))}
                      </div>
                    )}

                    {correctPlayers.length === 0 && wrongPlayers.length === 0 && (
                      <div className="text-xs text-slate-400 italic">Personne n'a répondu à temps...</div>
                    )}
                 </div>
              </Card>
            )}

            <Card className="!bg-rose-50/80 border-rose-200 p-4 shadow-lg shadow-rose-500/5">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-rose-700 text-sm mb-1">Le saviez-vous ?</h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {data.explanation}
                  </p>
                </div>
              </div>
            </Card>
            
            {(isHost || !isHost) && (
              <Button 
                variant="primary" 
                fullWidth 
                onClick={onNext}
                disabled={!isHost && !isRevealed} // Only host can skip or everyone after reveal
                className={`${isHost ? 'animate-bounce-slight shadow-xl shadow-rose-500/20' : 'hidden'}`}
              >
                Question Suivante <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizScreen;