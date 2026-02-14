import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode, GameItem, Question, Player } from './types';
import { fetchQuestions } from './api';
import { supabase } from './supabaseClient';
import HomeScreen from './components/HomeScreen';
import JoinGameScreen from './components/JoinGameScreen';
import LobbyScreen from './components/LobbyScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { Loader2 } from 'lucide-react';

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ITEMS_PER_GAME = 25;

function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
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
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setIsJoining(true);
    }
  }, []);

  // Écoute des réponses en temps réel pour le Host
  useEffect(() => {
    if (gameState.isMultiplayer && gameState.role === 'host' && gameState.gameCode && gameState.status === 'playing') {
      const currentQuestion = gameState.items[gameState.currentIndex];
      if (!currentQuestion) return;

      const channel = supabase
        .channel('answers_realtime')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'answers', 
            filter: `game_code=eq.${gameState.gameCode}` 
          },
          (payload) => {
            if (payload.new.question_id === currentQuestion.id) {
              setCurrentAnswers(prev => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameState.gameCode, gameState.role, gameState.currentIndex, gameState.status]);

  const resetToMenu = useCallback(() => {
    setIsJoining(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());

    setGameState(prev => ({
      ...prev,
      status: 'menu',
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
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const hostGame = async () => {
    setIsLoading(true);
    const code = generateGameCode();
    
    const { error } = await supabase.from('games').insert({
      code,
      status: 'waiting',
      mode: 'qcm',
      current_index: 0
    });

    if (error) {
      alert("Erreur de création");
      setIsLoading(false);
      return;
    }

    const questions = await fetchQuestions([]);
    const items = shuffle(questions).slice(0, ITEMS_PER_GAME);

    setGameState(prev => ({
      ...prev,
      status: 'lobby',
      isMultiplayer: true,
      role: 'host',
      gameCode: code,
      items: items,
      players: []
    }));

    setIsLoading(false);

    supabase
      .channel('players_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'players', filter: `game_code=eq.${code}` },
        (payload) => {
          const newPlayer = payload.new as Player;
          setGameState(prev => ({
            ...prev,
            players: [...prev.players, newPlayer]
          }));
        }
      )
      .subscribe();
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

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({ game_code: code, name, avatar })
      .select()
      .single();

    if (playerError) {
      alert("Impossible de rejoindre.");
      setIsLoading(false);
      return;
    }

    const questions = await fetchQuestions([]);
    
    setGameState(prev => ({
      ...prev,
      status: 'lobby',
      isMultiplayer: true,
      role: 'player',
      gameCode: code,
      playerId: playerData.id,
      items: []
    }));

    setIsLoading(false);

    supabase
      .channel('game_status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${code}` },
        async (payload) => {
          const newStatus = payload.new.status;
          const newIndex = payload.new.current_index;
          
          if (newStatus === 'playing') {
             const items = shuffle(questions).slice(0, ITEMS_PER_GAME);
             setGameState(prev => ({
               ...prev,
               status: 'playing',
               items: items,
               currentIndex: newIndex
             }));
          } else if (newStatus === 'finished') {
             setGameState(prev => ({ ...prev, status: 'finished' }));
          } else {
             setGameState(prev => ({ ...prev, currentIndex: newIndex }));
             setCurrentAnswers([]); // Reset answers on index change
          }
        }
      )
      .subscribe();
  };

  const startMultiplayerGame = async () => {
    if (!gameState.gameCode) return;
    await supabase.from('games').update({ status: 'playing', current_index: 0 }).eq('code', gameState.gameCode);
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  const startSoloGame = useCallback(async (mode: GameMode, categories: string[]) => {
    setIsLoading(true);
    try {
      const questions = await fetchQuestions(categories);
      const items = shuffle(questions).slice(0, ITEMS_PER_GAME);
      
      setGameState({
        status: 'playing', mode: 'qcm', items, currentIndex: 0, score: 0, history: [],
        isMultiplayer: false, role: 'solo', gameCode: null, playerId: null, players: []
      });
    } catch (e) {
      alert("Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswer = async (isCorrect: boolean, selectedIndex?: number) => {
    const currentItem = gameState.items[gameState.currentIndex];
    
    if (isCorrect) {
      setGameState(prev => ({ ...prev, score: prev.score + 100 }));
    }

    // Si multijoueur et c'est un joueur (pas le host)
    if (gameState.isMultiplayer && gameState.role === 'player' && gameState.playerId && gameState.gameCode) {
      // 1. Update score du joueur
      if (isCorrect) {
        await supabase.from('players').update({ score: gameState.score + 100 }).eq('id', gameState.playerId);
      }
      
      // 2. Logger la réponse dans la table answers
      await supabase.from('answers').insert({
        game_code: gameState.gameCode,
        player_id: gameState.playerId,
        question_id: currentItem.id,
        answer_index: selectedIndex ?? -1,
        is_correct: isCorrect
      });
    }
  };

  const nextItem = async () => {
    const nextIdx = gameState.currentIndex + 1;
    setCurrentAnswers([]); // Clear previous answers for the next question
    
    if (nextIdx >= gameState.items.length) {
      finishGame();
    } else {
      setGameState(prev => ({ ...prev, currentIndex: nextIdx }));
      if (gameState.isMultiplayer && gameState.role === 'host' && gameState.gameCode) {
        await supabase.from('games').update({ current_index: nextIdx }).eq('code', gameState.gameCode);
      }
    }
  };

  const finishGame = async () => {
    setLastScore(gameState.score);
    setGameState(prev => ({ ...prev, status: 'finished' }));
    if (gameState.isMultiplayer && gameState.role === 'host' && gameState.gameCode) {
        await supabase.from('games').update({ status: 'finished' }).eq('code', gameState.gameCode);
    }
  };

  const renderContent = () => {
    if (gameState.status === 'lobby') {
        return <LobbyScreen role={gameState.role as 'host' | 'player'} gameCode={gameState.gameCode || ''} players={gameState.players} onStartGame={startMultiplayerGame} onLeave={resetToMenu} />;
    }
    if (gameState.status === 'playing') {
        const isHost = gameState.role === 'host';
        const currentItem = gameState.items[gameState.currentIndex];
        
        // Calculer les joueurs corrects/incorrects pour le host
        const correctPlayers = currentAnswers
          .filter(a => a.is_correct)
          .map(a => gameState.players.find(p => p.id === a.player_id)?.name || "Inconnu");
        const wrongPlayers = currentAnswers
          .filter(a => !a.is_correct)
          .map(a => gameState.players.find(p => p.id === a.player_id)?.name || "Inconnu");

        return (
          <div className="animate-fade-in h-full flex flex-col pt-4 sm:pt-10">
             <div className="flex-1">
                <QuizScreen 
                  data={currentItem as Question} 
                  currentNumber={gameState.currentIndex + 1} 
                  total={gameState.items.length} 
                  onAnswer={(isCorrect, idx) => handleAnswer(isCorrect, idx)} 
                  onNext={nextItem}
                  onBack={resetToMenu}
                  isHost={isHost}
                  correctPlayers={correctPlayers}
                  wrongPlayers={wrongPlayers}
                />
             </div>
             {!isHost && gameState.role !== 'solo' && (
               <div className="text-center text-xs text-rose-400 pb-2 font-medium">Tes réponses comptent pour le score ! 💕</div>
             )}
          </div>
        );
    }
    if (gameState.status === 'finished') {
        return <ResultScreen score={gameState.score} maxScore={gameState.items.length * 100} onRestart={resetToMenu} />;
    }
  };

  return (
    <div className="min-h-screen text-[#2D1B2E] font-sans overflow-x-hidden relative selection:bg-rose-200 selection:text-rose-900">
      <div className="mesh-blob top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-rose-300/50" />
      <div className="mesh-blob top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-200/50" />
      <div className="mesh-blob bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-200/30" />

      <div className="w-full h-full min-h-screen">
        {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#E85D75] animate-spin mx-auto mb-4" />
                    <p className="text-xl font-bold text-rose-600">Connexion d'amour...</p>
                </div>
            </div>
        )}

        {gameState.status === 'menu' && !isJoining && (
            <HomeScreen onStartSolo={startSoloGame} lastScore={lastScore} onHostGame={hostGame} onJoinGame={() => setIsJoining(true)} />
        )}

        {gameState.status === 'menu' && isJoining && (
            <JoinGameScreen onBack={resetToMenu} onJoin={joinGame} initialCode={new URLSearchParams(window.location.search).get('code') || ''} />
        )}

        {gameState.status !== 'menu' && renderContent()}
      </div>
    </div>
  );
}

export default App;