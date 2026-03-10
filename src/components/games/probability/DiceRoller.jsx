import React, { useState } from 'react'

export default function DiceRoller({ onBack }) {
  const [numDice, setNumDice] = useState(1)
  const [numSides, setNumSides] = useState(6)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [rolls, setRolls] = useState(0)
  const [message, setMessage] = useState('Roll the dice!')
  const [isRolling, setIsRolling] = useState(false)

  const rollDice = () => {
    if (isRolling) return

    setIsRolling(true)
    setMessage('Rolling...')

    // Simulate rolling animation
    setTimeout(() => {
      const newResults = []
      let sum = 0

      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * numSides) + 1
        newResults.push(roll)
        sum += roll
      }

      setResults(newResults)
      setTotal(sum)
      setRolls(rolls + 1)
      setMessage(`🎲 Rolled! Total: ${sum}`)
      setIsRolling(false)
    }, 800)
  }

  const resetGame = () => {
    setResults([])
    setTotal(0)
    setRolls(0)
    setMessage('Roll the dice!')
  }

  const averageRoll = rolls > 0 ? (total / rolls).toFixed(2) : '0'

  return (
    <div className="game-board">
      <div className="game-title">
        <h3>🎲 Dice Roller</h3>
      </div>

      <div className="game-message">
        {message}
      </div>

      <div className="dice-settings">
        <div className="setting-group">
          <label>Number of Dice:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={numDice}
            onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isRolling || rolls > 0}
          />
        </div>
        <div className="setting-group">
          <label>Dice Sides:</label>
          <select
            value={numSides}
            onChange={(e) => setNumSides(parseInt(e.target.value))}
            disabled={isRolling || rolls > 0}
          >
            <option value="4">D4</option>
            <option value="6">D6</option>
            <option value="8">D8</option>
            <option value="12">D12</option>
            <option value="20">D20</option>
            <option value="100">D100</option>
          </select>
        </div>
      </div>

      {results.length > 0 && (
        <div className="dice-results">
          <div className="dice-rolls">
            {results.map((result, idx) => (
              <div key={idx} className="dice-result">
                {result}
              </div>
            ))}
          </div>
          <div className="dice-total">
            <span>Total:</span>
            <strong>{total}</strong>
          </div>
        </div>
      )}

      <div className="game-stats">
        <div className="stat">
          <span>Total Rolls:</span>
          <strong>{rolls}</strong>
        </div>
        <div className="stat">
          <span>Average:</span>
          <strong>{averageRoll}</strong>
        </div>
      </div>

      <button 
        onClick={rollDice} 
        className="game-button primary"
        disabled={isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>

      {rolls > 0 && (
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
