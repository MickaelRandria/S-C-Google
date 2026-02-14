import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode, GameItem, Question, Player } from './types';
import { fetchQuestions } from './api';
import { supabase } from './supabaseClient';
import HomeScreen from './components/HomeScreen';
import JoinGameScreen from './components/JoinGameScreen';
import LobbyScreen from './components/LobbyScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import CategoryAnnounce from './components/CategoryAnnounce';
import ImposteurGame from './components/ImposteurGame';
import TruthLieGame from './components/TruthLieGame';
import DilemmaGame from './components/DilemmaGame';
import { Loader2 } from 'lucide-react';

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

type StepType = 'menu' | 'lobby' | 'announce' | 'qcm' | 'minigame' | 'finished';

const GAME_FLOW = [
  { type: 'announce', category: 'Musique Perso' },
  { type: 'qcm_block', category: 'Musique Perso', count: 5 },
  { type: 'minigame', gameId: 'impostor' },
  { type: 'announce', category: 'Amour & Séries' },
  { type: 'qcm_block', category: 'Amour & Séries', count: 5 },
  { type: 'minigame', gameId: 'truth_lie' },
  { type: 'announce', category: 'Sport & Love' },
  { type: 'qcm_block', category: 'Sport & Love', count: 5 },
  { type: 'minigame', gameId: 'dilemma_express' },
  { type: 'announce', category: 'Culture G Spéciale' },
  { type: 'qcm_block', category: 'Culture G Spéciale', count: 5 },
  { type: 'minigame', gameId: 'impostor' },
  { type: 'announce', category: 'Musique Générale' },
  { type: 'qcm_block', category: 'Musique Générale', count: 5 },
];

function App() {
  const [gameState, setGameState] = useState<GameState & { flowIndex: number, currentStep: StepType }>({
    status: 'menu',
    currentStep: 'menu',
    flowIndex: 0,
    mode: 'qcm',
    items: [],
    currentIndex: 0,
    score: 0,
    history: [],
    isMultiplayer: false,
    role: 'solo',
    gameCode: null,
    playerId: null,
    players: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);

  // Écoute des réponses en temps réel pour le Host
  useEffect(() => {
    if (gameState.isMultiplayer && gameState.role === 'host' && gameState.gameCode && gameState.currentStep === 'qcm') {
      const currentItem = gameState.items[gameState.currentIndex];
      if (!currentItem) return;

      const channel = supabase
        .channel('answers_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'answers', filter: `game_code=eq.${gameState.gameCode}` },
          (payload) => {
            if (payload.new.question_id === currentItem.id) {
              setCurrentAnswers(prev => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [gameState.gameCode, gameState.role, gameState.currentIndex, gameState.currentStep]);

  // Écoute du changement d'étape global (Flow Sync)
  useEffect(() => {
    if (gameState.isMultiplayer && gameState.role === 'player' && gameState.gameCode) {
      const channel = supabase
        .channel('game_flow_sync')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${gameState.gameCode}` },
          async (payload) => {
            const flowIdx = payload.new.current_index;
            const flowStep = GAME_FLOW[flowIdx];
            if (!flowStep) {
              if (payload.new.status === 'finished') setGameState(prev => ({ ...prev, currentStep: 'finished' }));
              return;
            }
            
            // Re-fetch questions si nécessaire ou utiliser locale
            const questions = await fetchQuestions([]);
            // On reconstruit les items basés sur le flow
            let allItems: Question[] = [];
            GAME_FLOW.forEach(step => {
              if (step.type === 'qcm_block') {
                const catQ = shuffle(questions.filter(q => q.category === step.category)).slice(0, step.count);
                allItems = [...allItems, ...catQ];
              }
            });

            setGameState(prev => ({
              ...prev,
              flowIndex: flowIdx,
              currentStep: (flowStep.type === 'announce' ? 'announce' : flowStep.type === 'qcm_block' ? 'qcm' : 'minigame') as StepType,
              items: allItems,
              currentIndex: prev.currentIndex // Logic to align currentIndex with QCM block position
            }));
            setCurrentAnswers([]);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [gameState.gameCode, gameState.role]);

  const resetToMenu = useCallback(() => {
    setIsJoining(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());

    setGameState(prev => ({
      ...prev,
      status: 'menu',
      currentStep: 'menu',
      flowIndex: 0,
      isMultiplayer: false,
      role: 'solo',
      gameCode: null,
      playerId: null,
      players: [],
      currentIndex: 0,
      score: 0
    }));
    setCurrentAnswers([]);
  }, []);

  const generateGameCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const hostGame = async () => {
    setIsLoading(true);
    const code = generateGameCode();
    await supabase.from('games').insert({ code, status: 'waiting', mode: 'qcm', current_index: 0 });

    const questions = await fetchQuestions([]);
    let allItems: Question[] = [];
    GAME_FLOW.forEach(step => {
      if (step.type === 'qcm_block') {
        const catQ = shuffle(questions.filter(q => q.category === step.category)).slice(0, step.count);
        allItems = [...allItems, ...catQ];
      }
    });

    setGameState(prev => ({
      ...prev,
      status: 'lobby',
      currentStep: 'lobby',
      isMultiplayer: true,
      role: 'host',
      gameCode: code,
      items: allItems,
      players: []
    }));

    setIsLoading(false);

    supabase.channel('players_channel').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `game_code=eq.${code}` },
      (payload) => { setGameState(prev => ({ ...prev, players: [...prev.players, payload.new as Player] })); }
    ).subscribe();
  };

  const joinGame = async (code: string, name: string, avatar: string) => {
    setIsLoading(true);
    const { data: gameData } = await supabase.from('games').select('*').eq('code', code).single();
    if (!gameData) { alert("Partie introuvable !"); setIsLoading(false); return; }

    const { data: playerData } = await supabase.from('players').insert({ game_code: code, name, avatar }).select().single();
    
    setGameState(prev => ({
      ...prev,
      status: 'lobby',
      currentStep: 'lobby',
      isMultiplayer: true,
      role: 'player',
      gameCode: code,
      playerId: playerData.id,
      items: []
    }));
    setIsLoading(false);
  };

  const startFlow = async () => {
    if (gameState.isMultiplayer && gameState.role === 'host') {
      await supabase.from('games').update({ status: 'playing', current_index: 0 }).eq('code', gameState.gameCode);
    }
    setGameState(prev => ({ ...prev, currentStep: 'announce', flowIndex: 0 }));
  };

  const nextFlowStep = async () => {
    const nextIdx = gameState.flowIndex + 1;
    if (nextIdx >= GAME_FLOW.length) {
      if (gameState.isMultiplayer && gameState.role === 'host') {
        await supabase.from('games').update({ status: 'finished' }).eq('code', gameState.gameCode);
      }
      setGameState(prev => ({ ...prev, currentStep: 'finished' }));
      return;
    }

    const nextStep = GAME_FLOW[nextIdx];
    let nextStepType: StepType = 'announce';
    if (nextStep.type === 'qcm_block') nextStepType = 'qcm';
    if (nextStep.type === 'minigame') nextStepType = 'minigame';

    if (gameState.isMultiplayer && gameState.role === 'host') {
      await supabase.from('games').update({ current_index: nextIdx }).eq('code', gameState.gameCode);
    }

    setGameState(prev => ({
      ...prev,
      flowIndex: nextIdx,
      currentStep: nextStepType,
      currentIndex: nextStep.type === 'qcm_block' ? prev.currentIndex : prev.currentIndex
    }));
    setCurrentAnswers([]);
  };

  const handleQcmAnswer = async (isCorrect: boolean, idx?: number) => {
    if (isCorrect) setGameState(prev => ({ ...prev, score: prev.score + 100 }));
    if (gameState.isMultiplayer && gameState.role === 'player' && gameState.playerId) {
      if (isCorrect) await supabase.from('players').update({ score: gameState.score + 100 }).eq('id', gameState.playerId);
      await supabase.from('answers').insert({
        game_code: gameState.gameCode,
        player_id: gameState.playerId,
        question_id: gameState.items[gameState.currentIndex].id,
        answer_index: idx ?? -1,
        is_correct: isCorrect
      });
    }
  };

  const handleNextQcm = () => {
    const currentBlockIdxInItems = gameState.currentIndex + 1;
    // Check if we finished the 5 questions of the current block
    if (currentBlockIdxInItems % 5 === 0) {
      nextFlowStep();
    } else {
      setGameState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      setCurrentAnswers([]);
    }
  };

  const renderContent = () => {
    if (gameState.currentStep === 'lobby') return <LobbyScreen role={gameState.role as 'host' | 'player'} gameCode={gameState.gameCode || ''} players={gameState.players} onStartGame={startFlow} onLeave={resetToMenu} />;
    
    if (gameState.currentStep === 'announce') {
      const step = GAME_FLOW[gameState.flowIndex];
      return <CategoryAnnounce category={step.category || ''} isHost={gameState.role === 'host' || gameState.role === 'solo'} onStart={nextFlowStep} />;
    }

    if (gameState.currentStep === 'qcm') {
      const currentItem = gameState.items[gameState.currentIndex];
      const correctPlayers = currentAnswers.filter(a => a.is_correct).map(a => gameState.players.find(p => p.id === a.player_id)?.name || "Joueur");
      const wrongPlayers = currentAnswers.filter(a => !a.is_correct).map(a => gameState.players.find(p => p.id === a.player_id)?.name || "Joueur");

      return (
        <QuizScreen 
          data={currentItem as Question} 
          currentNumber={(gameState.currentIndex % 5) + 1} 
          total={5} 
          onAnswer={handleQcmAnswer} 
          onNext={handleNextQcm}
          onBack={resetToMenu}
          isHost={gameState.role === 'host'}
          correctPlayers={correctPlayers}
          wrongPlayers={wrongPlayers}
          answeredCount={currentAnswers.length}
          totalPlayers={gameState.players.length}
        />
      );
    }

    if (gameState.currentStep === 'minigame') {
      const step = GAME_FLOW[gameState.flowIndex];
      if (step.gameId === 'impostor') return <ImposteurGame isHost={gameState.role === 'host'} players={gameState.players} gameCode={gameState.gameCode || ''} onFinish={nextFlowStep} />;
      // Fix: Ensure the fallback object matches the Player interface by providing missing required properties
      if (step.gameId === 'truth_lie') return <TruthLieGame isHost={gameState.role === 'host'} currentPlayer={gameState.players[0] || { name: 'Toi', game_code: 'SOLO', avatar: '👤', score: 0 }} onFinish={nextFlowStep} />;
      if (step.gameId === 'dilemma_express') return <DilemmaGame onFinish={nextFlowStep} />;
    }

    if (gameState.currentStep === 'finished') return <ResultScreen score={gameState.score} maxScore={25 * 100} onRestart={resetToMenu} />;
  };

  return (
    <div className="min-h-screen text-[#2D1B2E] font-sans overflow-x-hidden relative selection:bg-rose-200 selection:text-rose-900">
      <div className="mesh-blob top-[-15%] left-[-15%] w-[80vw] h-[80vw] bg-pink-400/20 animate-mesh" />
      <div className="mesh-blob top-[20%] right-[-15%] w-[70vw] h-[70vw] bg-amber-400/20 animate-mesh" style={{ animationDelay: '-5s' }} />
      <div className="mesh-blob bottom-[-20%] left-[10%] w-[60vw] h-[60vw] bg-rose-300/15 animate-mesh" style={{ animationDelay: '-10s' }} />
      
      <div className="w-full h-full min-h-screen z-10 relative">
        {isLoading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md"><Loader2 className="w-12 h-12 text-[#E85D75] animate-spin" /></div>}
        {gameState.currentStep === 'menu' && !isJoining && <HomeScreen onStartSolo={startFlow} lastScore={null} onHostGame={hostGame} onJoinGame={() => setIsJoining(true)} />}
        {gameState.currentStep === 'menu' && isJoining && <JoinGameScreen onBack={resetToMenu} onJoin={joinGame} initialCode={new URLSearchParams(window.location.search).get('code') || ''} />}
        {gameState.currentStep !== 'menu' && renderContent()}
      </div>
    </div>
  );
}

export default App;