import React, { useEffect } from 'react'

export default function Projects({ navigate }) {
  const projects = [
    {
      id: 'photography',
      title: 'Photography',
      emoji: '📷',
      description: 'Visual moments',
      color: 'accent-1',
      path: '/photography',
      status: 'live'
    },
    {
      id: 'cryto',
      title: 'Crypto',
      emoji: '₿',
      description: 'Digital assets',
      color: 'accent-2',
      path: '/cryto',
      status: 'live'
    },
    {
      id: 'gaming',
      title: 'Gaming',
      emoji: '🎮',
      description: 'Digital worlds',
      color: 'accent-2',
      path: '/gaming',
      status: 'in-progress'
    },
    {
      id: 'news',
      title: 'News',
      emoji: '📰',
      description: 'Latest headlines',
      color: 'accent-1',
      path: '/news',
      status: 'coming'
    },
    {
      id: 'f1',
      title: 'F1',
      emoji: '🏎️',
      description: 'Racing passion',
      color: 'accent-2',
      path: '/f1',
      status: 'coming'
    },
    {
      id: 'fashion',
      title: 'Fashion',
      emoji: '👔',
      description: 'Style trends',
      color: 'accent-1',
      path: '/fashion',
      status: 'coming'
    },
    {
      id: 'travel',
      title: 'Travel',
      emoji: '✈️',
      description: 'Adventures',
      color: 'accent-2',
      path: '/travel',
      status: 'coming'
    },
    {
      id: 'cooking',
      title: 'Cooking',
      emoji: '🍳',
      description: 'Delicious recipes',
      color: 'accent-1',
      path: '/cooking',
      status: 'coming'
    },
    {
      id: 'cricket',
      title: 'Cricket',
      emoji: '🏏',
      description: 'Sport & stats',
      color: 'accent-2',
      path: '/cricket',
      status: 'coming'
    },
    {
      id: 'music',
      title: 'Music',
      emoji: '🎵',
      description: 'Sound & beats',
      color: 'accent-2',
      path: '/music',
      status: 'coming'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  useEffect(() => {
    // Scroll to top when projects page loads
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2>Projects</h2>
      </div>

      <div className="projects-grid">
        {projects.map((project) => {
          const isLive = project.status === 'live'
          const inProgress = project.status === 'in-progress'
          const isInteractive = isLive || inProgress

          return (
          <div
            key={project.id}
            className={`project-card project-card--${project.id} ${isInteractive ? '' : 'not-implemented'}`}
            onClick={() => isInteractive && handleCardClick(project.path)}
            role="button"
            tabIndex={isInteractive ? "0" : "-1"}
            onKeyPress={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
                handleCardClick(project.path)
              }
            }}
            style={!isInteractive ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <div className="status-indicator">
              {isLive ? (
                <span className="status-badge status-implemented">
                  <i className="fa-solid fa-check"></i> Live
                </span>
              ) : inProgress ? (
                <span className="status-badge status-progress">
                  <i className="fa-solid fa-spinner"></i> In Progress
                </span>
              ) : (
                <span className="status-badge status-not-implemented">
                  <i className="fa-solid fa-circle-xmark"></i> Coming
                </span>
              )}
            </div>
            <div className="card-content">
              <div className="card-emoji">
                {project.emoji}
              </div>
              <h3>{project.title}</h3>
              <p className="card-description">{project.description}</p>
            </div>
            {isInteractive && (
              <div className="card-arrow">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            )}
          </div>
          )
        })}
      </div>
    </section>
  )
}
