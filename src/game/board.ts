import type { Board, Direction, MoveResult, Position } from './types';

const create2DArray = (
  rows: number,
  cols: number,
  defaultValue: number,
): number[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => defaultValue),
  );

export const createEmptyBoard = (): Board => create2DArray(4, 4, 0);

export const addRandomTile = (board: Board): Board => {
  const emptyPositions = findEmptyPositions(board);
  if (emptyPositions.length === 0) {
    return board;
  }

  const position = getRandomPosition(emptyPositions);
  if (position === null) {
    return board;
  }

  const value = Math.random() < 0.9 ? 2 : 4;
  return setTileValue(board, position, value);
};

const findEmptyPositions = (board: Board): Position[] =>
  board.reduce<Position[]>((positions, row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
    return positions;
  }, []);

const getRandomPosition = (positions: Position[]): Position | null => {
  if (positions.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * positions.length);
  return positions[index] ?? null;
};

const setTileValue = (board: Board, position: Position, value: number): Board =>
  board.map((row, rowIndex) =>
    rowIndex === position.row
      ? row.map((cell, colIndex) => (colIndex === position.col ? value : cell))
      : [...row],
  );

// Simple rotate to map all moves to left move
const rotateMatrix = (matrix: number[][], times: number): number[][] => {
  let result = matrix;
  for (let i = 0; i < times; i++) {
    result =
      result[0]?.map((_, index) =>
        result.map((row) => row[row.length - 1 - index] ?? 0),
      ) ?? result;
  }
  return result;
};

export const isValidRow = (row: unknown): row is number[] =>
  Array.isArray(row) && row.every((cell) => typeof cell === 'number');

const moveLeft = (
  row: number[],
): { row: number[]; score: number; merged: boolean } => {
  // Remove all zeros and get numbers only
  const numbers = row.filter((x) => x !== 0);
  const result: number[] = [];
  let score = 0;
  let merged = false;
  let i = 0;

  // Process merging
  while (i < numbers.length) {
    if (i + 1 < numbers.length && numbers[i] === numbers[i + 1]) {
      const mergedValue = (numbers[i] ?? 0) * 2;
      result.push(mergedValue);
      score += mergedValue;
      merged = true;
      i += 2;
    } else {
      result.push(numbers[i] ?? 0);
      i++;
    }
  }

  // Fill the rest with zeros
  while (result.length < 4) {
    result.push(0);
  }

  // Check if any movement occurred
  const moved = row.some((value, index) => value !== result[index]);

  return {
    row: result,
    score,
    merged: merged || moved,
  };
};

export const moveBoard = (board: Board, direction: Direction): MoveResult => {
  // Number of rotations needed for each direction
  const rotations = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
  };

  // Rotate board to convert all moves to left moves
  const rotatedBoard = rotateMatrix(board, rotations[direction]);
  let totalScore = 0;
  let anyMerged = false;

  // Process each row
  const newBoard = rotatedBoard.map((row) => {
    const { row: newRow, score, merged } = moveLeft(row);
    totalScore += score;
    anyMerged = anyMerged || merged;
    return newRow;
  });

  // Rotate back to original orientation
  const finalBoard = rotateMatrix(newBoard, (4 - rotations[direction]) % 4);

  return {
    board: finalBoard,
    scoreIncrease: totalScore,
    merged: anyMerged,
  };
};
