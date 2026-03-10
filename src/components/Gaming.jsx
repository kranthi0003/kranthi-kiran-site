import React, { useState } from 'react'

export default function Gaming() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const gameCategories = [
    {
      id: 'guessing',
      title: 'Guessing Games',
      emoji: '🎯',
      description: 'Test your intuition and guessing skills',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'probability',
      title: 'Probability Games',
      emoji: '🎲',
      description: 'Understand odds and probability',
      accentColor: 'accent-2',
      implemented: false
    },
    {
      id: 'chess',
      title: 'Chess Games',
      emoji: '♟️',
      description: 'Classic strategy and chess puzzles',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'stock',
      title: 'Stock Games',
      emoji: '📈',
      description: 'Learn trading and market mechanics',
      accentColor: 'accent-2',
      implemented: false
    }
  ]

  const renderCategoryContent = () => {
    const category = gameCategories.find(c => c.id === selectedCategory)
    
    return (
      <div className="category-games-page">
        <button 
          className="back-to-categories-btn" 
          onClick={() => setSelectedCategory(null)}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Categories
        </button>
        <div className="category-page-header">
          <span className="category-emoji">{category.emoji}</span>
          <h2>{category.title}</h2>
          <p>{category.description}</p>
        </div>
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h3>Games Coming Soon!</h3>
          <p>Build your games here and they will appear in this section.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-gamepad"></i>
        <h1>Gaming</h1>
        <p>Play interactive games and sharpen your skills</p>
      </div>

      <div className="feature-content">
        {!selectedCategory ? (
          <div className="projects-grid">
            {gameCategories.map((category) => (
              <div
                key={category.id}
                className={`project-card project-card--${category.id} ${category.implemented ? 'implemented' : 'not-implemented'}`}
                onClick={() => category.implemented && setSelectedCategory(category.id)}
                role="button"
                tabIndex={category.implemented ? "0" : "-1"}
                onKeyPress={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && category.implemented) {
                    setSelectedCategory(category.id)
                  }
                }}
                style={!category.implemented ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <div className="status-indicator">
                  {category.implemented ? (
                    <span className="status-badge status-implemented">
                      <i className="fa-solid fa-check"></i> Implemented
                    </span>
                  ) : (
                    <span className="status-badge status-not-implemented">
                      <i className="fa-solid fa-circle-xmark"></i> Coming Soon
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-emoji">{category.emoji}</div>
                  <h3>{category.title}</h3>
                  <p className="card-description">{category.description}</p>
                </div>
                {category.implemented && (
                  <div className={`card-arrow ${category.accentColor === 'accent-1' ? 'accent-1' : 'accent-2'}`}>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          renderCategoryContent()
        )}
      </div>
    </div>
  )
}
