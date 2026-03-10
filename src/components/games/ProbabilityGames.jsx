import React, { useState } from 'react'
import CoinFlip from './probability/CoinFlip'
import DiceRoller from './probability/DiceRoller'

export default function ProbabilityGames({ onBack }) {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'coinflip',
      title: 'Coin Flip',
      description: 'Predict heads or tails',
      icon: '🪙'
    },
    {
      id: 'dicegame',
      title: 'Dice Game',
      description: 'Roll dice and predict outcomes',
      icon: '🎲'
    }
  ]

  const renderGame = () => {
    switch (selectedGame) {
      case 'coinflip':
        return <CoinFlip onBack={() => setSelectedGame(null)} />
      case 'dicegame':
        return <DiceRoller onBack={() => setSelectedGame(null)} />
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
        <h2>Probability Games</h2>
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
