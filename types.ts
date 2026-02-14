export type QcmCategory = 'Musique Perso' | 'Amour & Séries' | 'Sport & Love' | 'Culture G Spéciale' | 'Musique Générale';
export type DebateCategory = 'Couple' | 'Relation' | 'Intimité' | 'Futur';

export interface Question {
  id: string;
  type: 'qcm';
  q: string;
  opts: string[];
  ok: number; // Index of correct answer (0-3)
  explanation: string;
  category: QcmCategory;
}

export interface Debate {
  id: string;
  type: 'debate';
  title: string;
  scenario: string;
  optionA: string;
  optionB: string;
  category: DebateCategory;
}

export type GameItem = Question | Debate;

export type GameMode = 'qcm' | 'debate' | 'mixte';

// --- MULTIPLAYER TYPES ---

export interface Player {
  id?: string;
  game_code: string;
  name: string;
  avatar: string;
  score: number;
}

export interface GameSession {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  current_index: number;
  mode: GameMode;
}

export interface GameState {
  status: 'menu' | 'lobby' | 'playing' | 'finished';
  mode: GameMode;
  items: GameItem[];
  currentIndex: number;
  score: number;
  history: boolean[]; // Track correct/incorrect for QCM
  // Multiplayer specifics
  isMultiplayer: boolean;
  role: 'host' | 'player' | 'solo';
  gameCode: string | null;
  playerId: string | null; // My player ID if I am a player
  players: Player[]; // List of all players in lobby
}