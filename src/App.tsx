import './App.css';

import React from 'react';

import Game from './Game.tsx';
import { GameProvider } from './GameContext.tsx';

const App: React.FC = () => {
  return (
    <div className="app">
      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
};

export default App;