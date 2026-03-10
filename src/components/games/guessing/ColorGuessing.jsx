import React, { useState, useEffect } from 'react'

export default function ColorGuessing({ onBack }) {
  const [targetColor, setTargetColor] = useState('')
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const [hint, setHint] = useState('')

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#D62828', '#06A77D'
  ]

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setTargetColor(randomColor)
    setGuess('')
    setAttempts(0)
    setMessage('Guess the hex color code!')
    setGameWon(false)
    setHint('')
  }

  const handleGuess = () => {
    const normalizedGuess = guess.toUpperCase().startsWith('#') 
      ? guess.toUpperCase() 
      : '#' + guess.toUpperCase()

    if (!/^#[0-9A-F]{6}$/.test(normalizedGuess)) {
      setMessage('Please enter a valid hex color (e.g., #FF5733)')
      return
    }

    setAttempts(attempts + 1)

    if (normalizedGuess === targetColor) {
      setMessage(`🎉 Correct! The color was ${targetColor}. You got it in ${attempts + 1} attempts!`)
      setGameWon(true)
    } else {
      setMessage(`❌ Wrong! Try again.`)
      
      // Generate a hint
      const hexNum = parseInt(normalizedGuess.slice(1), 16)
      const targetNum = parseInt(targetColor.slice(1), 16)
      if (hexNum < targetNum) {
        setHint('💡 Try a higher value')
      } else {
        setHint('💡 Try a lower value')
      }
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
        <h3>🎨 Color Guessing Game</h3>
      </div>

      <div className="game-color-display">
        <div 
          className="color-box" 
          style={{ backgroundColor: targetColor }}
        ></div>
        <p className="color-hex">{targetColor}</p>
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

      {hint && <div className="game-hint">{hint}</div>}

      {!gameWon ? (
        <div className="game-input-group">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter hex code (e.g., FF5733)..."
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
