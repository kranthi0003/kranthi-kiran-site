import React from 'react'

export default function FeaturedProjects({ navigate }) {
  const projects = [
    {
      id: 'photography',
      title: 'Photography',
      emoji: '📷',
      description: 'Visual moments',
      color: 'accent-1',
      path: '/photography'
    },
    {
      id: 'cryto',
      title: 'Crypto',
      emoji: '₿',
      description: 'Digital assets',
      color: 'accent-2',
      path: '/cryto'
    },
    {
      id: 'news',
      title: 'News',
      emoji: '📰',
      description: 'Latest headlines',
      color: 'accent-1',
      path: '/news'
    },
    {
      id: 'f1',
      title: 'F1',
      emoji: '🏎️',
      description: 'Racing passion',
      color: 'accent-2',
      path: '/f1'
    },
    {
      id: 'fashion',
      title: 'Fashion',
      emoji: '👔',
      description: 'Style trends',
      color: 'accent-1',
      path: '/fashion'
    },
    {
      id: 'travel',
      title: 'Travel',
      emoji: '✈️',
      description: 'Adventures',
      color: 'accent-2',
      path: '/travel'
    },
    {
      id: 'cooking',
      title: 'Cooking',
      emoji: '🍳',
      description: 'Delicious recipes',
      color: 'accent-1',
      path: '/cooking'
    },
    {
      id: 'cricket',
      title: 'Cricket',
      emoji: '🏏',
      description: 'Sport & stats',
      color: 'accent-2',
      path: '/cricket'
    },
    {
      id: 'gaming',
      title: 'Gaming',
      emoji: '🎮',
      description: 'Digital worlds',
      color: 'accent-1',
      path: '/gaming'
    },
    {
      id: 'music',
      title: 'Music',
      emoji: '🎵',
      description: 'Sound & beats',
      color: 'accent-2',
      path: '/music'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2>Featured</h2>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-card project-card--${project.id}`}
            onClick={() => handleCardClick(project.path)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(project.path)
              }
            }}
          >
            <div className="card-content">
              <div className="card-emoji">
                {project.emoji}
              </div>
              <h3>{project.title}</h3>
              <p className="card-description">{project.description}</p>
            </div>
            <div className="card-arrow">
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
