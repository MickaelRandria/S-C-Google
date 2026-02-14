import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { Heart, Scale, Users } from 'lucide-react';

interface DilemmaGameProps {
  onFinish: () => void;
}

const DILEMMAS = [
  {
    question: "Tu gagnes 50 000€ mais tu ne peux plus jamais manger au restaurant avec ton/ta partenaire.",
    optionA: "Je prends l'argent 💰",
    optionB: "Je garde mes restos ! 🍽️"
  },
  {
    question: "Tu peux lire les pensées de ton/ta partenaire pendant 24h. Tu le fais ?",
    optionA: "Oui, je veux savoir ! 🧠",
    optionB: "Non, secret défense 🤐"
  },
  {
    question: "Tu dois poster la photo la plus gênante de ton couple sur Instagram pour un voyage aux Maldives.",
    optionA: "On poste ! ✈️",
    optionB: "Jamais ! 😤"
  }
];

const DilemmaGame: React.FC<DilemmaGameProps> = ({ onFinish }) => {
  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState(false);
  const [reveal, setReveal] = useState(false);

  const d = DILEMMAS[index];

  const nextDilemma = () => {
    if (index < DILEMMAS.length - 1) {
      setIndex(index + 1);
      setVoted(false);
      setReveal(false);
    } else {
      onFinish();
    }
  };

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
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-rose-200/50 text-center font-bold text-slate-800 text-lg shadow-sm italic leading-relaxed">
           "{d.question}"
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant={voted ? 'primary' : 'glass'} 
            fullWidth 
            size="lg" 
            className="h-24 !justify-center flex-col"
            onClick={() => setVoted(true)}
          >
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Option A</span>
            <span className="font-bold">{d.optionA}</span>
          </Button>

          <Button 
            variant={voted ? 'secondary' : 'glass'} 
            fullWidth 
            size="lg" 
            className="h-24 !justify-center flex-col"
            onClick={() => setVoted(true)}
          >
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Option B</span>
            <span className="font-bold">{d.optionB}</span>
          </Button>
        </div>

        {voted && !reveal && (
          <Button variant="primary" fullWidth onClick={() => setReveal(true)}>Révéler les votes</Button>
        )}

        {reveal && (
          <div className="animate-fade-in space-y-4">
             <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                   <div className="text-2xl font-black text-rose-500">60%</div>
                   <div className="text-[10px] font-bold uppercase text-slate-400">Team A</div>
                </div>
                <div className="w-px h-8 bg-rose-100" />
                <div className="text-center">
                   <div className="text-2xl font-black text-slate-400">40%</div>
                   <div className="text-[10px] font-bold uppercase text-slate-400">Team B</div>
                </div>
             </div>
             <Button variant="primary" fullWidth onClick={nextDilemma}>
               {index < DILEMMAS.length - 1 ? 'Dilemme Suivant ➡️' : 'Reprendre le Quiz 💘'}
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DilemmaGame;