import React, { useState, useEffect } from 'react'

export default function CoinFlip({ onBack }) {
  const [prediction, setPrediction] = useState('')
  const [result, setResult] = useState('')
  const [flips, setFlips] = useState(0)
  const [wins, setWins] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [message, setMessage] = useState('Make your prediction!')

  const handleFlip = (choice) => {
    if (isFlipping) return

    setPrediction(choice)
    setIsFlipping(true)
    setMessage('Flipping coin...')

    // Simulate flip animation
    setTimeout(() => {
      const coinResult = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(coinResult)

      const newFlips = flips + 1
      setFlips(newFlips)

      if (choice === coinResult) {
        setWins(wins + 1)
        setMessage(`✅ You won! It was ${coinResult}!`)
      } else {
        setMessage(`❌ You lost! It was ${coinResult}!`)
      }

      setIsFlipping(false)
    }, 1500)
  }

  const resetGame = () => {
    setFlips(0)
    setWins(0)
    setPrediction('')
    setResult('')
    setMessage('Make your prediction!')
  }

  const winRate = flips > 0 ? ((wins / flips) * 100).toFixed(1) : '0'

  return (
    <div className="game-board">
      <div className="game-title">
        <h3>🪙 Coin Flip Game</h3>
      </div>

      <div className="game-message">
        {message}
      </div>

      <div className="coin-flip-container">
        <div className={`coin ${isFlipping ? 'flipping' : ''} ${result === 'heads' ? 'heads' : ''}`}>
          <div className="coin-front">H</div>
          <div className="coin-back">T</div>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span>Flips:</span>
          <strong>{flips}</strong>
        </div>
        <div className="stat">
          <span>Wins:</span>
          <strong>{wins}</strong>
        </div>
        <div className="stat">
          <span>Win Rate:</span>
          <strong>{winRate}%</strong>
        </div>
      </div>

      {!isFlipping && (
        <div className="button-group">
          <button 
            onClick={() => handleFlip('heads')} 
            className="game-button"
            style={{ flex: 1 }}
          >
            Predict Heads
          </button>
          <button 
            onClick={() => handleFlip('tails')} 
            className="game-button"
            style={{ flex: 1 }}
          >
            Predict Tails
          </button>
        </div>
      )}

      {flips > 0 && (
        <button onClick={resetGame} className="game-button secondary">
          Reset Stats
        </button>
      )}

      <button onClick={onBack} className="game-button secondary">
        Back
      </button>
    </div>
  )
}
