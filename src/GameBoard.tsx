import { useGame } from './GameContext';
import Tile from './Tile';

const GameBoard = () => {
  const { state } = useGame();

  return (
    <div className="game-container">
      <div className="game-board">
        {state.board.map((row, i) =>
          row.map((value, j) => <Tile key={`${i}-${j}`} value={value} />),
        )}
      </div>
    </div>
  );
};

export default GameBoard;
