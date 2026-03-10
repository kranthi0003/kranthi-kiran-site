import React, { useState } from 'react'
import StockSimulator from './stock/StockSimulator'
import PricePredictor from './stock/PricePredictor'

export default function StockGames({ onBack }) {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'simulator',
      title: 'Stock Simulator',
      description: 'Trade stocks with virtual money',
      icon: '💰'
    },
    {
      id: 'predictor',
      title: 'Price Predictor',
      description: 'Predict stock price movements',
      icon: '📊'
    }
  ]

  const renderGame = () => {
    switch (selectedGame) {
      case 'simulator':
        return <StockSimulator onBack={() => setSelectedGame(null)} />
      case 'predictor':
        return <PricePredictor onBack={() => setSelectedGame(null)} />
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
        <h2>Stock Games</h2>
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
