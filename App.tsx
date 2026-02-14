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
  const [gameState, setGameState] = useState<GameState & { flowIndex: number, currentStep: StepType, playerName: string | null, minigamePhase: string }>({
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
    playerName: null,
    players: [],
    minigamePhase: 'setup'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);

  // 1. Écoute des réponses en temps réel pour le Host (compteur X/Y)
  useEffect(() => {
    if (gameState.isMultiplayer && gameState.role === 'host' && gameState.gameCode && gameState.currentStep === 'qcm') {
      const currentItem = gameState.items[gameState.currentIndex];
      if (!currentItem) return;

      const channel = supabase
        .channel(`answers_${gameState.gameCode}`)
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
  }, [gameState.gameCode, gameState.role, gameState.currentIndex, gameState.currentStep, gameState.items]);

  // 2. SYNCHRONISATION REALTIME (Flow & Questions & Mini-jeux) pour les Joueurs
  useEffect(() => {
    if (gameState.isMultiplayer && gameState.role === 'player' && gameState.gameCode) {
      const channel = supabase
        .channel(`game_sync_${gameState.gameCode}`)
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'games', 
            filter: `code=eq.${gameState.gameCode}` 
          },
          async (payload) => {
            const newData = payload.new;
            const flowIdx = newData.current_index;
            const questionIdx = newData.question_index;
            const newStatus = newData.status;
            const mgPhase = newData.minigame_phase;

            if (newStatus === 'finished') {
              setGameState(prev => ({ ...prev, currentStep: 'finished', status: 'finished' }));
              return;
            }

            const flowStep = GAME_FLOW[flowIdx];
            if (!flowStep) return;

            const nextStepType: StepType = 
              flowStep.type === 'announce' ? 'announce' : 
              flowStep.type === 'qcm_block' ? 'qcm' : 'minigame';

            setGameState(prev => ({
              ...prev,
              flowIndex: flowIdx,
              currentIndex: questionIdx !== undefined ? questionIdx : prev.currentIndex,
              currentStep: nextStepType,
              status: (newStatus as any) || prev.status,
              minigamePhase: mgPhase || prev.minigamePhase
            }));
            
            setCurrentAnswers([]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [gameState.gameCode, gameState.role, gameState.isMultiplayer]);

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
      playerName: null,
      players: [],
      currentIndex: 0,
      score: 0,
      minigamePhase: 'setup'
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

    try {
      await supabase
        .from('games')
        .delete()
        .eq('status', 'finished')
        .lt('created_at', new Date(Date.now() - 3600000).toISOString());
    } catch (e) {
      console.warn("Nettoyage échoué", e);
    }

    const code = generateGameCode();
    const allQuestions = await fetchQuestions([]);
    let allItems: Question[] = [];
    
    // Génération propre sans répétitions
    GAME_FLOW.forEach(step => {
      if (step.type === 'qcm_block') {
        const catQ = shuffle(allQuestions.filter(q => q.category === step.category))
          // On s'assure de ne pas reprendre des questions déjà ajoutées
          .filter(q => !allItems.find(item => item.id === q.id))
          .slice(0, step.count);
        allItems = [...allItems, ...catQ];
      }
    });
    const questionOrder = allItems.map(q => q.id);

    const { error } = await supabase.from('games').insert({ 
      code, 
      status: 'waiting', 
      mode: 'qcm', 
      current_index: 0,
      question_index: 0,
      question_order: questionOrder,
      minigame_phase: 'setup'
    });

    if (error) {
      alert("Erreur lors de la création de la partie.");
      setIsLoading(false);
      return;
    }

    setGameState(prev => ({
      ...prev,
      status: 'lobby',
      currentStep: 'lobby',
      isMultiplayer: true,
      role: 'host',
      gameCode: code,
      items: allItems,
      playerId: 'HOST-' + code, // ID unique pour le host participant
      playerName: 'Le Maître du Jeu',
      players: []
    }));

    setIsLoading(false);

    supabase.channel(`players_${code}`).on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `game_code=eq.${code}` },
      (payload) => { setGameState(prev => ({ ...prev, players: [...prev.players, payload.new as Player] })); }
    ).subscribe();
  };

  const joinGame = async (code: string, name: string, avatar: string) => {
    setIsLoading(true);
    
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single();
    
    if (gameError || !gameData) { 
      alert("Partie introuvable !"); 
      setIsLoading(false); 
      return; 
    }

    if (gameData.status !== 'waiting') {
      alert("Cette partie a déjà commencé ou est terminée !");
      setIsLoading(false);
      return;
    }

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('game_code', code)
      .eq('name', name)
      .maybeSingle();

    let currentPlayerId: string;

    if (existingPlayer) {
      currentPlayerId = existingPlayer.id;
    } else {
      const { data: playerData, error: insertError } = await supabase
        .from('players')
        .insert({ game_code: code, name, avatar, score: 0 })
        .select()
        .single();
      
      if (insertError) {
        alert("Impossible de rejoindre la partie.");
        setIsLoading(false);
        return;
      }
      currentPlayerId = playerData.id;
    }

    const questionOrder = gameData.question_order || [];
    let orderedItems: Question[] = [];
    if (questionOrder.length > 0) {
      const allQuestions = await fetchQuestions([]);
      orderedItems = questionOrder
        .map((id: string) => allQuestions.find(q => q.id === id))
        .filter(Boolean) as Question[];
    }
    
    setGameState(prev => ({
      ...prev,
      status: gameData.status,
      currentStep: 'lobby',
      isMultiplayer: true,
      role: 'player',
      gameCode: code,
      playerId: currentPlayerId,
      playerName: name,
      items: orderedItems,
      flowIndex: gameData.current_index || 0,
      currentIndex: gameData.question_index || 0,
      minigamePhase: gameData.minigame_phase || 'setup'
    }));
    setIsLoading(false);
  };

  const startFlow = async () => {
    if (gameState.isMultiplayer && gameState.role === 'host') {
      await supabase.from('games').update({ status: 'playing', current_index: 0, question_index: 0 }).eq('code', gameState.gameCode);
    }
    setGameState(prev => ({ ...prev, currentStep: 'announce', flowIndex: 0, currentIndex: 0 }));
  };

  const nextFlowStep = async () => {
    const nextIdx = gameState.flowIndex + 1;
    if (nextIdx >= GAME_FLOW.length) {
      if (gameState.isMultiplayer && gameState.role === 'host') {
        await supabase.from('games').update({ status: 'finished' }).eq('code', gameState.gameCode);
      }
      setGameState(prev => ({ ...prev, currentStep: 'finished', status: 'finished' }));
      return;
    }

    const nextStep = GAME_FLOW[nextIdx];
    let nextStepType: StepType = 'announce';
    if (nextStep.type === 'qcm_block') nextStepType = 'qcm';
    if (nextStep.type === 'minigame') nextStepType = 'minigame';

    if (gameState.isMultiplayer && gameState.role === 'host') {
      await supabase.from('games')
        .update({ current_index: nextIdx, minigame_phase: 'setup' })
        .eq('code', gameState.gameCode);
      
      // Nettoyage des états des mini-jeux précédents
      await supabase.from('minigame_state').delete().eq('game_code', gameState.gameCode);
    }

    setGameState(prev => ({
      ...prev,
      flowIndex: nextIdx,
      currentStep: nextStepType,
      minigamePhase: 'setup'
    }));
    setCurrentAnswers([]);
  };

  const handleQcmAnswer = async (isCorrect: boolean, idx?: number) => {
    const currentItem = gameState.items[gameState.currentIndex];
    if (!currentItem) return;

    if (isCorrect) setGameState(prev => ({ ...prev, score: prev.score + 100 }));
    
    if (gameState.isMultiplayer && gameState.role === 'player' && gameState.playerId) {
      if (isCorrect) {
        const { data: pData } = await supabase.from('players').select('score').eq('id', gameState.playerId).single();
        const currentScore = pData?.score || 0;
        await supabase.from('players').update({ score: currentScore + 100 }).eq('id', gameState.playerId);
      }
      
      await supabase.from('answers').insert({
        game_code: gameState.gameCode,
        player_id: gameState.playerId,
        question_id: currentItem.id,
        answer_index: idx ?? -1,
        is_correct: isCorrect
      });
    }
  };

  const handleNextQcm = async () => {
    const nextIdx = gameState.currentIndex + 1;
    
    // TOUJOURS incrémenter d'abord localement et sur Supabase pour que les joueurs suivent
    if (gameState.isMultiplayer && gameState.role === 'host') {
      await supabase.from('games')
        .update({ question_index: nextIdx })
        .eq('code', gameState.gameCode);
    }
    
    setGameState(prev => ({ ...prev, currentIndex: nextIdx }));
    setCurrentAnswers([]);

    // PUIS vérifier si le bloc de 5 est terminé pour passer à l'étape suivante du flux
    if (nextIdx % 5 === 0) {
      nextFlowStep();
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
      if (!currentItem) return <div className="flex flex-col items-center justify-center h-[70vh]"><Loader2 className="w-12 h-12 text-rose-500 animate-spin" /><p className="text-rose-400 mt-4">Chargement de la question...</p></div>;

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
      const commonProps = {
        isHost: gameState.role === 'host',
        gameCode: gameState.gameCode || 'SOLO',
        playerId: gameState.playerId || 'SOLO-ID',
        playerName: gameState.playerName || 'Toi',
        players: gameState.players,
        onFinish: nextFlowStep
      };

      if (step.gameId === 'impostor') return <ImposteurGame {...commonProps} />;
      if (step.gameId === 'truth_lie') return <TruthLieGame {...commonProps} />;
      if (step.gameId === 'dilemma_express') return <DilemmaGame {...commonProps} />;
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