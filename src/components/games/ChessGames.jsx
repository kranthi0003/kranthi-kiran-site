import React, { useState } from 'react'
import ChessPuzzles from './chess/ChessPuzzles'
import ChessAI from './chess/ChessAI'

export default function ChessGames({ onBack }) {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'puzzles',
      title: 'Chess Puzzles',
      description: 'Solve chess puzzles and improve tactics',
      icon: '🧩'
    },
    {
      id: 'ai',
      title: 'Play vs AI',
      description: 'Challenge the computer in chess',
      icon: '🤖'
    }
  ]

  const renderGame = () => {
    switch (selectedGame) {
      case 'puzzles':
        return <ChessPuzzles onBack={() => setSelectedGame(null)} />
      case 'ai':
        return <ChessAI onBack={() => setSelectedGame(null)} />
      default:
        return null
    }
  }

  if (selectedGame) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button className="back-btn" onClick={() => setSelectedGame(null)}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
        {renderGame()}
      </div>
    )
  }

  return (
    <div className="game-category-container">
      <div className="category-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h2>Chess Games</h2>
      </div>

      <div className="games-list">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-item"
            onClick={() => setSelectedGame(game.id)}
          >
            <span className="game-icon">{game.icon}</span>
            <div className="game-info">
              <h3>{game.title}</h3>
              <p>{game.description}</p>
            </div>
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        ))}
      </div>
    </div>
  )
}
