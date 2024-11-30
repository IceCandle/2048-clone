import './Game.css';

interface TileProps {
  value: number;
}

const Tile = ({ value }: TileProps) => {
  return (
    <div className={`game-tile tile-${value}`}>{value !== 0 && value}</div>
  );
};

export default Tile;
