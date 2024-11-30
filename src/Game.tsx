import './Game.css';

import { useCallback, useEffect } from 'react';

import type { Direction } from './game/types';
import GameBoard from './GameBoard';
import { useGame } from './GameContext';

const Game = () => {
  const { state, dispatch } = useGame();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.gameOver || state.hasWon) return;

      const keyToDirection: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
      };

      const direction = keyToDirection[e.key];
      if (direction !== undefined) {
        e.preventDefault();
        dispatch({ type: 'MOVE', direction });
      }
    },
    [dispatch, state.gameOver, state.hasWon],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      <h1 className="game-header">128</h1>
      <div className="game-score">Score: {state.score}</div>
      <GameBoard />
      {state.gameOver && <div className="game-over">Game Over!</div>}
      {state.hasWon && <div className="game-won">You Win!</div>}
      <div className="button-container">
        <button
          className="game-button"
          onClick={() => {
            dispatch({ type: 'NEW_GAME' });
          }}
        >
          New Game
        </button>
        <button
          className="game-button"
          onClick={() => {
            dispatch({ type: 'UNDO' });
          }}
          disabled={state.previousStates.length === 0}
        >
          Undo
        </button>
      </div>
    </div>
  );
};

export default Game;
