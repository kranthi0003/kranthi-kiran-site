import React, { useState, useEffect } from 'react'

export default function NumberGuessing({ onBack }) {
  const [targetNumber, setTargetNumber] = useState(null)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1)
    setGuess('')
    setAttempts(0)
    setMessage('Guess a number between 1 and 100!')
    setGameWon(false)
  }

  const handleGuess = () => {
    const num = parseInt(guess)
    
    if (isNaN(num)) {
      setMessage('Please enter a valid number')
      return
    }

    setAttempts(attempts + 1)

    if (num === targetNumber) {
      setMessage(`🎉 Correct! You guessed it in ${attempts + 1} attempts!`)
      setGameWon(true)
    } else if (num < targetNumber) {
      setMessage(`📈 Too low! Try higher.`)
    } else {
      setMessage(`📉 Too high! Try lower.`)
    }

    setGuess('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameWon) {
      handleGuess()
    }
  }

  return (
    <div className="game-board">
      <div className="game-title">
        <h3>🔢 Number Guessing Game</h3>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span>Attempts:</span>
          <strong>{attempts}</strong>
        </div>
      </div>

      <div className="game-message" style={{
        color: gameWon ? '#4ade80' : '#fbbf24'
      }}>
        {message}
      </div>

      {!gameWon ? (
        <div className="game-input-group">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your guess..."
            className="game-input"
            autoFocus
          />
          <button onClick={handleGuess} className="game-button">
            Guess
          </button>
        </div>
      ) : (
        <button onClick={initializeGame} className="game-button primary">
          Play Again
        </button>
      )}

      <button onClick={onBack} className="game-button secondary">
        Back
      </button>
    </div>
  )
}
