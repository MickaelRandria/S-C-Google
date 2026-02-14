import React, { useState, useEffect } from 'react';
import { Debate } from '../types';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { ArrowRight, Scale, Heart, ArrowLeft } from 'lucide-react';

interface DebateScreenProps {
  data: Debate;
  currentNumber: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}

const DebateScreen: React.FC<DebateScreenProps> = ({ data, currentNumber, total, onNext, onBack }) => {
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [data.id]);

  const handleSelect = (choice: 'A' | 'B') => {
    if (selected) return;
    setSelected(choice);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 space-y-6">
      <div className="w-full flex items-center justify-start -mb-2">
        <Button variant="ghost" size="xs" onClick={onBack} className="!px-2 text-rose-400">
           <ArrowLeft className="w-4 h-4" /> Quitter
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-rose-600 pt-2">
        <span>💘 Débat {currentNumber} / {total}</span>
        <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
          <Heart className="w-4 h-4" /> Dilemme
        </span>
      </div>

      <ProgressBar current={currentNumber} total={total} />

      <div className="flex-1 flex flex-col space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E85D75] to-[#FF6B8A] text-center drop-shadow-sm">
            {data.title}
          </h2>
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-rose-200/50 text-center italic text-[#2D1B2E] leading-relaxed shadow-sm">
            "{data.scenario}"
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 flex-1 content-center">
          <Button
            onClick={() => handleSelect('A')}
            className={`
              h-auto min-h-[8rem] flex flex-col items-center justify-center p-6 text-center transition-all duration-300 border-2 rounded-2xl
              ${selected === 'A' 
                ? 'bg-[#E85D75] border-[#E85D75] scale-[1.02] shadow-xl shadow-rose-500/30 z-10 text-white' 
                : selected === 'B' 
                  ? 'bg-slate-100 border-slate-200 opacity-50 blur-[1px] text-slate-400' 
                  : 'bg-white/80 border-rose-200 hover:border-rose-400 hover:bg-white text-[#2D1B2E] hover:shadow-lg hover:shadow-rose-100'}
            `}
          >
            <span className={`text-2xl font-bold mb-2 ${selected === 'A' ? 'text-white' : 'text-[#E85D75]'}`}>Option A</span>
            <span className={`text-sm font-medium ${selected === 'A' ? 'text-rose-50' : 'text-slate-600'}`}>{data.optionA}</span>
          </Button>

          <div className="relative flex items-center justify-center -my-2 z-20">
            <div className="bg-white rounded-full p-2 border border-rose-200 text-xs font-bold text-rose-400 shadow-sm uppercase tracking-widest animate-pulse-heart">
              ❤️
            </div>
          </div>

          <Button
            onClick={() => handleSelect('B')}
            className={`
              h-auto min-h-[8rem] flex flex-col items-center justify-center p-6 text-center transition-all duration-300 border-2 rounded-2xl
              ${selected === 'B' 
                ? 'bg-[#D63B5C] border-[#D63B5C] scale-[1.02] shadow-xl shadow-rose-900/30 z-10 text-white' 
                : selected === 'A' 
                  ? 'bg-slate-100 border-slate-200 opacity-50 blur-[1px] text-slate-400' 
                  : 'bg-white/80 border-rose-200 hover:border-rose-400 hover:bg-white text-[#2D1B2E] hover:shadow-lg hover:shadow-rose-100'}
            `}
          >
             <span className={`text-2xl font-bold mb-2 ${selected === 'B' ? 'text-white' : 'text-[#D63B5C]'}`}>Option B</span>
             <span className={`text-sm font-medium ${selected === 'B' ? 'text-rose-50' : 'text-slate-600'}`}>{data.optionB}</span>
          </Button>
        </div>

        {selected && (
          <div className="animate-fade-in-up pt-4">
             <Button 
              variant="primary" 
              fullWidth 
              onClick={onNext}
              className="animate-bounce-slight shadow-xl shadow-rose-500/20"
            >
              Suivant <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateScreen;