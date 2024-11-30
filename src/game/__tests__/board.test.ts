import { describe, expect, it } from 'vitest';

import { moveBoard } from '../board';
import type { Board } from '../types';

describe('moveBoard', () => {
  it('should move tiles correctly to the left', () => {
    const initialBoard: Board = [
      [2, 2, 0, 0],
      [2, 0, 2, 0],
      [0, 0, 0, 2],
      [4, 4, 0, 0],
    ];

    const expected: Board = [
      [4, 0, 0, 0],
      [4, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 0, 0, 0],
    ];

    const result = moveBoard(initialBoard, 'LEFT');
    expect(result.board).toEqual(expected);
    expect(result.scoreIncrease).toBe(16); // 2+2=4, 2+2=4, 4+4=8 total points: 4+4+8=16
    expect(result.merged).toBe(true);
  });

  it('should not merge different numbers', () => {
    const initialBoard: Board = [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const expected: Board = [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveBoard(initialBoard, 'LEFT');
    expect(result.board).toEqual(expected);
    expect(result.scoreIncrease).toBe(0);
    expect(result.merged).toBe(false);
  });

  it('should handle empty board correctly', () => {
    const emptyBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveBoard(emptyBoard, 'LEFT');
    expect(result.board).toEqual(emptyBoard);
    expect(result.scoreIncrease).toBe(0);
    expect(result.merged).toBe(false);
  });

  it('should merge consecutive pairs correctly', () => {
    const initialBoard: Board = [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const expected: Board = [
      [4, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveBoard(initialBoard, 'LEFT');
    expect(result.board).toEqual(expected);
    expect(result.scoreIncrease).toBe(8); // Two merges of 2+2=4 each
    expect(result.merged).toBe(true);
  });
});
