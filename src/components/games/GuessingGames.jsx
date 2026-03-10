import React, { useState } from 'react'
import NumberGuessing from './guessing/NumberGuessing'
import ColorGuessing from './guessing/ColorGuessing'

export default function GuessingGames({ onBack }) {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'number',
      title: 'Number Guessing',
      description: 'Guess a number between 1-100',
      icon: '🔢'
    },
    {
      id: 'color',
      title: 'Color Guessing',
      description: 'Guess the color from hex code',
      icon: '🎨'
    }
  ]

  const renderGame = () => {
    switch (selectedGame) {
      case 'number':
        return <NumberGuessing onBack={() => setSelectedGame(null)} />
      case 'color':
        return <ColorGuessing onBack={() => setSelectedGame(null)} />
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
        <h2>Guessing Games</h2>
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
