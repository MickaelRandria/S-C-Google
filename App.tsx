import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode, GameItem, Question, Debate, Player } from './types';
import { fetchQuestions, fetchDebates } from './api';
import { supabase } from './supabaseClient';
import HomeScreen from './components/HomeScreen';
import JoinGameScreen from './components/JoinGameScreen';
import LobbyScreen from './components/LobbyScreen';
import QuizScreen from './components/QuizScreen';
import DebateScreen from './components/DebateScreen';
import ResultScreen from './components/ResultScreen';
import { Loader2 } from 'lucide-react';

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ITEMS_PER_GAME = 10;

function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    mode: 'mixte',
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setIsJoining(true);
    }
  }, []);

  const resetToMenu = useCallback(() => {
    setIsJoining(false);
    // Nettoyer l'URL
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
      mode: 'mixte',
      current_index: 0
    });

    if (error) {
      alert("Erreur de création");
      setIsLoading(false);
      return;
    }

    const [questions, debates] = await Promise.all([
        fetchQuestions([]),
        fetchDebates([])
    ]);
    const items = shuffle([...shuffle(questions).slice(0, 5), ...shuffle(debates).slice(0, 5)]);

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

    const [questions, debates] = await Promise.all([
        fetchQuestions([]),
        fetchDebates([])
    ]);
    
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
             const items = shuffle([...shuffle(questions).slice(0, 5), ...shuffle(debates).slice(0, 5)]);
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
    let items: GameItem[] = [];
    try {
      if (mode === 'qcm') {
        const questions = await fetchQuestions(categories);
        items = shuffle(questions).slice(0, ITEMS_PER_GAME);
      } else if (mode === 'debate') {
        const debates = await fetchDebates(categories);
        items = shuffle(debates).slice(0, Math.min(debates.length, ITEMS_PER_GAME));
      } else if (mode === 'mixte') {
        const [questions, debates] = await Promise.all([fetchQuestions([]), fetchDebates([])]);
        items = shuffle([...shuffle(questions).slice(0, 5), ...shuffle(debates).slice(0, 5)]);
      }
      setGameState({
        status: 'playing', mode, items, currentIndex: 0, score: 0, history: [],
        isMultiplayer: false, role: 'solo', gameCode: null, playerId: null, players: []
      });
    } catch (e) {
      alert("Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (gameState.items[gameState.currentIndex].type === 'qcm' && isCorrect) {
      setGameState(prev => ({ ...prev, score: prev.score + 100 }));
      if (gameState.isMultiplayer && gameState.role === 'player' && gameState.playerId) {
          supabase.from('players').update({ score: gameState.score + 100 }).eq('id', gameState.playerId).then();
      }
    }
  };

  const nextItem = async () => {
    const nextIdx = gameState.currentIndex + 1;
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
        const canControl = gameState.role === 'host' || gameState.role === 'solo';
        return (
          <div className="animate-fade-in h-full flex flex-col pt-4 sm:pt-10">
             <div className="flex-1">
              {gameState.items[gameState.currentIndex]?.type === 'qcm' ? (
                <QuizScreen 
                  data={gameState.items[gameState.currentIndex] as Question} 
                  currentNumber={gameState.currentIndex + 1} 
                  total={gameState.items.length} 
                  onAnswer={handleAnswer} 
                  onNext={canControl ? nextItem : () => {}}
                  onBack={resetToMenu}
                />
              ) : (
                <DebateScreen 
                  data={gameState.items[gameState.currentIndex] as Debate} 
                  currentNumber={gameState.currentIndex + 1} 
                  total={gameState.items.length} 
                  onNext={canControl ? nextItem : () => {}}
                  onBack={resetToMenu}
                />
              )}
             </div>
             {gameState.role === 'player' && <div className="text-center text-xs text-rose-400 pb-2 font-medium">L'autre couple attend... 💕</div>}
          </div>
        );
    }
    if (gameState.status === 'finished') {
        const qcmCount = gameState.items.filter(i => i.type === 'qcm').length;
        return <ResultScreen score={gameState.score} maxScore={qcmCount * 100} onRestart={resetToMenu} />;
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const initialCode = urlParams.get('code') || '';

  return (
    <div className="min-h-screen text-[#2D1B2E] font-sans overflow-x-hidden relative selection:bg-rose-200 selection:text-rose-900">
      
      {/* MESH GRADIENT VALENTINE BACKGROUND */}
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
            <JoinGameScreen onBack={resetToMenu} onJoin={joinGame} initialCode={initialCode} />
        )}

        {gameState.status !== 'menu' && renderContent()}
      </div>
    </div>
  );
}

export default App;