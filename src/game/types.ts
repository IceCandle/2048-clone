export type Board = number[][];
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  board: Board;
  score: number;
  gameOver: boolean;
  previousStates: GameHistoryState[];
  hasWon: boolean;
}

interface GameHistoryState {
  board: Board;
  score: number;
}

export type Position = {
  row: number;
  col: number;
};

export interface MoveResult {
  board: Board;
  scoreIncrease: number;
  merged: boolean;
}
