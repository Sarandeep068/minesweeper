import React from 'react';
import './App.css';
import Board from './components/Board';

const Game = ({ height, width, mines }) => {
  return (
    <div className="game">
      <Board height={height} width={width} mines={mines} />
    </div>
  );

}

export default Game;