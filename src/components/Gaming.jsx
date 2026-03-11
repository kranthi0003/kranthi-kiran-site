import React, { useState } from 'react'

export default function Gaming() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const gameCategories = [
    {
      id: 'guessing-games',
      title: 'Guessing Games',
      emoji: '🎯',
      description: 'Test your intuition and guessing skills',
      accentColor: 'accent-2',
      implemented: true,
      status: 'wip'
    },
    {
      id: 'brain-teasers',
      title: 'Brain Teasers',
      emoji: '🧠',
      description: 'Challenge your mind with tricky puzzles',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'strategy-games',
      title: 'Strategy Games',
      emoji: '♟️',
      description: 'Plan and execute winning tactics',
      accentColor: 'accent-2',
      implemented: false
    },
    {
      id: 'math-playground',
      title: 'Math Playground',
      emoji: '➗',
      description: 'Fun math challenges and logic problems',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'probability',
      title: 'Probability',
      emoji: '🎲',
      description: 'Understand odds and probability',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'reflex-speed',
      title: 'Reflex & Speed',
      emoji: '⚡',
      description: 'Test your speed and reaction time',
      accentColor: 'accent-2',
      implemented: false
    },
    {
      id: 'memory-games',
      title: 'Memory Games',
      emoji: '🧩',
      description: 'Improve your recall and memory skills',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'funny-games',
      title: 'Funny Games',
      emoji: '😂',
      description: 'Enjoy hilarious and light-hearted games',
      accentColor: 'accent-2',
      implemented: false
    },
    {
      id: 'simulation-lab',
      title: 'Simulation Lab',
      emoji: '🕹️',
      description: 'Experience virtual worlds and scenarios',
      accentColor: 'accent-1',
      implemented: false
    },
    {
      id: 'casual-arcade',
      title: 'Casual Arcade',
      emoji: '🎮',
      description: 'Relax with easy and fun arcade games',
      accentColor: 'accent-2',
      implemented: false
    }
  ];

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
    );
  }

  return (
    <section className="featured-section theme-gaming">
      <div className="section-header">
        <h2>Gaming</h2>
        <span className="title-underline"></span>
      </div>
      <div className="projects-grid">
        {!selectedCategory ? (
          gameCategories.map((category) => (
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
                {category.implemented && category.status === 'wip' ? (
                  <span className="status-badge status-wip">
                    <i className="fa-solid fa-spinner" style={{color:'#FFD600'}}></i> <span style={{color:'#FFD600'}}>WIP</span>
                  </span>
                ) : category.implemented ? (
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
          ))
        ) : (
          renderCategoryContent()
        )}
      </div>
    </section>
  );
}
