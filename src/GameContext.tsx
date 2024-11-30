import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  addRandomTile,
  createEmptyBoard,
  isValidRow,
  moveBoard,
} from './game/board';
import type { Direction, GameState } from './game/types';

interface GameProviderProps {
  children: ReactNode;
}

type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO' };

const createInitialBoard = () =>
  addRandomTile(addRandomTile(createEmptyBoard()));

const DEFAULT_GAME_STATE: GameState = {
  board: createInitialBoard(),
  score: 0,
  gameOver: false,
  previousStates: [],
  hasWon: false,
};

const isGameOver = (board: number[][]): boolean => {
  // Validate board structure
  if (!Array.isArray(board) || !board.every(isValidRow)) {
    return false;
  }

  const hasEmptyCell = board.some(
    (row) => Array.isArray(row) && row.some((cell) => cell === 0),
  );

  if (hasEmptyCell) {
    return false;
  }

  // Check for possible merges horizontally and vertically
  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    if (row == null) continue;

    for (let j = 0; j < row.length - 1; j++) {
      const current = row[j];
      const right = row[j + 1];
      const below = board[i + 1]?.[j];

      if (current === right || (below != null && current === below)) {
        return false;
      }
    }
  }

  return true;
};

const loadStateFromLocalStorage = (): GameState => {
  try {
    const savedState = localStorage.getItem('gameState');
    if (savedState != null) {
      const parsedState = JSON.parse(savedState) as GameState;
      // Validate the loaded state has the correct structure
      if (
        Array.isArray(parsedState.board) &&
        typeof parsedState.score === 'number' &&
        Array.isArray(parsedState.previousStates)
      ) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }
  return DEFAULT_GAME_STATE;
};

const GameContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<GameAction>;
    }
  | undefined
>(undefined);

const hasWinningTile = (board: number[][]): boolean =>
  board.some((row) => row.some((cell) => cell === 128));

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE': {
      if (state.gameOver || state.hasWon) {
        return state;
      }

      const moveResult = moveBoard(state.board, action.direction);

      // If no tiles merged or moved, return current state
      if (!moveResult.merged) {
        return state;
      }

      const previousState = {
        board: state.board,
        score: state.score,
      };

      const updatedBoard = addRandomTile(moveResult.board);

      const newScore = state.score + moveResult.scoreIncrease;
      const newHasWon = hasWinningTile(updatedBoard);

      return {
        board: updatedBoard,
        score: newScore,
        gameOver: isGameOver(updatedBoard),
        previousStates: [previousState, ...state.previousStates],
        hasWon: newHasWon,
      };
    }

    case 'NEW_GAME':
      return {
        ...DEFAULT_GAME_STATE,
        board: createInitialBoard(), // Create a fresh board each time
      };

    case 'UNDO': {
      const [previousState, ...remainingStates] = state.previousStates;
      if (previousState == null) {
        return state;
      }

      return {
        ...state,
        board: previousState.board,
        score: previousState.score,
        previousStates: remainingStates,
        gameOver: false,
        hasWon: false,
      };
    }

    default:
      return state;
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    null,
    loadStateFromLocalStorage,
  );

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
