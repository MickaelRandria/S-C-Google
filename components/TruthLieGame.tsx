import React, { useState } from 'react';
import { Player } from '../types';
import Card from './Card';
import Button from './Button';
import { Check, X, User } from 'lucide-react';

interface TruthLieGameProps {
  isHost: boolean;
  currentPlayer: Player;
  onFinish: () => void;
}

const TruthLieGame: React.FC<TruthLieGameProps> = ({ isHost, currentPlayer, onFinish }) => {
  const [phase, setPhase] = useState<'writing' | 'voting' | 'reveal'>('writing');
  const [choices, setChoices] = useState(['', '', '']);
  const [lieIndex, setLieIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-6 animate-fade-in max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-rose-100 rounded-full mb-2">
          <User className="w-8 h-8 text-[#E85D75]" />
        </div>
        <h1 className="text-3xl font-black text-[#2D1B2E] tracking-tighter">2 VÉRITÉS 1 MENSONGE ✌️</h1>
        <p className="text-sm text-slate-500 font-medium">Tour de : <span className="text-rose-500 font-bold">{currentPlayer.name}</span></p>
      </div>

      <Card className="w-full space-y-4 !bg-white/60">
        {phase === 'writing' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Écris 3 faits sur toi, dont 1 mensonge !</p>
            {[0, 1, 2].map(i => (
              <input 
                key={i}
                type="text"
                placeholder={`Affirmation ${i+1}`}
                className="w-full p-3 rounded-xl border border-rose-100 focus:border-rose-500 focus:outline-none bg-white/50"
              />
            ))}
            <div className="flex justify-between text-xs font-bold text-rose-400 px-2">
               <span>Sélectionne le mensonge :</span>
               <div className="flex gap-4">
                 {[0, 1, 2].map(i => (
                   <button key={i} onClick={() => setLieIndex(i)} className={`w-6 h-6 rounded-full border ${lieIndex === i ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200'}`}>{i+1}</button>
                 ))}
               </div>
            </div>
            <Button variant="primary" fullWidth onClick={() => setPhase('voting')}>C'est bon !</Button>
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-4 py-2">
             <h3 className="font-bold text-center text-slate-800">Où est le mensonge ?</h3>
             <div className="space-y-3">
               {['Je sais jongler', 'J\'ai peur des papillons', 'J\'ai déjà vu 10 fois Titanic'].map((text, i) => (
                 <button key={i} className="w-full p-4 text-left bg-white border border-rose-100 rounded-xl font-medium hover:border-rose-400 transition-all flex justify-between items-center group">
                   <span>{text}</span>
                   <span className="w-8 h-8 rounded-full border-2 border-rose-50 flex items-center justify-center font-bold text-rose-200 group-hover:text-rose-400">?</span>
                 </button>
               ))}
             </div>
             {isHost && <Button variant="secondary" fullWidth onClick={() => setPhase('reveal')}>Révéler la vérité</Button>}
          </div>
        )}

        {phase === 'reveal' && (
          <div className="space-y-4 py-2 text-center animate-scale-in">
             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Check className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-black text-emerald-600 uppercase">Révélation !</h3>
             <p className="text-slate-700">Le mensonge était le n°2 !</p>
             <Button variant="primary" fullWidth className="mt-6" onClick={onFinish}>Continuer le quiz</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TruthLieGame;