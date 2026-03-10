import React from 'react'

export default function FeaturedPreview({ navigate }) {
  const featured = [
    {
      id: 'photography',
      title: 'Photography',
      emoji: '📷',
      description: 'Visual moments captured',
      path: '/photography',
    },
    {
      id: 'cryto',
      title: 'Crypto',
      emoji: '₿',
      description: 'Digital assets tracker',
      path: '/cryto',
    },
    {
      id: 'gaming',
      title: 'Gaming',
      emoji: '🎮',
      description: 'Fun mini games',
      path: '/gaming',
    },
  ]

  return (
    <section className="featured-preview-section">
      <div className="section-header">
        <h2>What I've Been Building</h2>
      </div>
      
      <div className="featured-preview-grid">
        {featured.map((project) => (
          <div
            key={project.id}
            className={`featured-preview-card featured-preview-card--${project.id}`}
            onClick={() => navigate(project.path)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(project.path)
              }
            }}
          >
            <span className="preview-emoji">{project.emoji}</span>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <span className="preview-arrow">→</span>
          </div>
        ))}
      </div>

      <button 
        className="view-all-btn"
        onClick={() => navigate('/projects')}
      >
        View All Projects <i className="fa-solid fa-arrow-right"></i>
      </button>
    </section>
  )
}
