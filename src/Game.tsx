import './Game.css';

import React, { useEffect } from 'react';

import Board from './Board';
import { useGame } from './GameContext';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        dispatch({
          type: 'MOVE',
          direction: e.key.replace('Arrow', '').toUpperCase() as
            | 'UP'
            | 'DOWN'
            | 'LEFT'
            | 'RIGHT',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return (
    <div className="game-container">
      <h1 className="game-header">128</h1>
      <div className="game-score">Score: {state.score}</div>
      <Board />
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
