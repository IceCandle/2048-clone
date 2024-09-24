import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

interface GameProviderProps {
  children: ReactNode;
}

type GameState = {
  board: number[][];
  score: number;
  gameOver: boolean;
  previousStates: {
    board: number[][];
    score: number;
  }[];
  hasWon: boolean;
};

type GameAction =
  | { type: 'MOVE'; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }
  | { type: 'NEW_GAME' }
  | { type: 'ADD_TILE' }
  | { type: 'UPDATE_SCORE'; points: number }
  | { type: 'SET_GAME_OVER' }
  | { type: 'UNDO' }
  | { type: 'LOAD_GAME' };

const createEmptyBoard = (): number[][] =>
  Array.from({ length: 4 }, () => Array<number>(4).fill(0));

const addRandomTile = (board: number[][]): number[][] => {
  const emptyTiles = board
    .flatMap((row, i) =>
      row.map((val, j) => (val === 0 ? ([i, j] as [number, number]) : null)),
    )
    .filter((val): val is [number, number] => val !== null);

  if (emptyTiles.length === 0) return board;

  const randomIndex = Math.floor(Math.random() * emptyTiles.length);
  const [randomRow, randomCol] = emptyTiles[randomIndex] ?? [-1, -1];
  const newValue = Math.random() < 0.9 ? 2 : 4;

  return board.map((row, i) =>
    row.map((val, j) => (i === randomRow && j === randomCol ? newValue : val)),
  );
};

const moveBoard = (
  board: number[][],
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
): [number[][], number] => {
  let score = 0;

  const rotate = (b: number[][]): number[][] => {
    return (b[0]?.map((_, index) => b.map((row) => row[index]).reverse()) ??
      []) as number[][];
  };

  const moveLeft = (b: number[][]): number[][] =>
    b.map((row) => {
      const filtered = row.filter((tile) => tile !== 0);
      const merged = filtered.reduce<number[]>((acc, curr) => {
        if (acc.length > 0 && acc[acc.length - 1] === curr) {
          score += curr * 2;
          return [...acc.slice(0, -1), curr * 2];
        } else {
          return [...acc, curr];
        }
      }, []);
      return merged.concat(Array(4 - merged.length).fill(0));
    });

  let newBoard = board.map((row) => [...row]);

  if (direction === 'UP') newBoard = rotate(rotate(rotate(newBoard)));
  if (direction === 'RIGHT') newBoard = rotate(rotate(newBoard));
  if (direction === 'DOWN') newBoard = rotate(newBoard);

  newBoard = moveLeft(newBoard);

  if (direction === 'UP') newBoard = rotate(newBoard);
  if (direction === 'RIGHT') newBoard = rotate(rotate(newBoard));
  if (direction === 'DOWN') newBoard = rotate(rotate(rotate(newBoard)));

  return [newBoard, score];
};

const isGameOver = (board: number[][]): boolean => {
  const hasEmptyTile = board.some((row) => row.includes(0));
  if (hasEmptyTile) return false;

  const hasMergeableTiles = board.some((row, i) =>
    row.some(
      (tile, j) =>
        (i < 3 && tile === (board[i + 1]?.[j] ?? -1)) ||
        (j < 3 && tile === (row[j + 1] ?? -1)),
    ),
  );

  return !hasMergeableTiles;
};

const initialState: GameState = {
  board: addRandomTile(addRandomTile(createEmptyBoard())),
  score: 0,
  gameOver: false,
  previousStates: [],
  hasWon: false,
};

const loadStateFromLocalStorage = (): GameState => {
  const savedState = localStorage.getItem('gameState');
  return savedState != null
    ? (JSON.parse(savedState) as GameState)
    : initialState;
};

const GameContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<GameAction>;
    }
  | undefined
>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  if (state.hasWon && action.type !== 'NEW_GAME') {
    return state;
  }
  switch (action.type) {
    case 'MOVE': {
      const previousState = { board: state.board, score: state.score };
      const [newBoard, scoreIncrease] = moveBoard(
        state.board,
        action.direction,
      );
      const boardChanged =
        JSON.stringify(newBoard) !== JSON.stringify(state.board);
      if (!boardChanged) return state;
      const updatedBoard = addRandomTile(newBoard);
      const newScore = state.score + scoreIncrease;
      const gameOver = isGameOver(updatedBoard);
      const hasWon = newBoard.some((row) => row.includes(128));
      return {
        board: updatedBoard,
        score: newScore,
        gameOver,
        previousStates: [previousState, ...state.previousStates],
        hasWon: state.hasWon || hasWon,
      };
    }
    case 'NEW_GAME':
      return {
        board: addRandomTile(addRandomTile(createEmptyBoard())),
        score: 0,
        gameOver: false,
        previousStates: [],
        hasWon: false,
      };
    case 'UNDO': {
      if (state.previousStates.length === 0) return state;
      if (state.previousStates[0] === undefined) return state;
      const previousState = state.previousStates[0];
      return {
        ...state,
        board: previousState.board,
        score: previousState.score,
        previousStates: state.previousStates.slice(1),
        gameOver: false,
        hasWon: false,
      };
    }
    case 'LOAD_GAME': {
      return loadStateFromLocalStorage();
    }
    case 'ADD_TILE':
      return { ...state, board: addRandomTile(state.board) };
    case 'UPDATE_SCORE':
      return { ...state, score: state.score + action.points };
    case 'SET_GAME_OVER':
      return { ...state, gameOver: true };
    default:
      return state;
  }
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    loadStateFromLocalStorage(),
  );
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    dispatch({ type: 'LOAD_GAME' });
  }, []);
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
