import React, { useEffect } from 'react'

export default function Projects() {
  useEffect(() => {
    // Scroll to top when projects page loads
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section className="projects-section" aria-labelledby="projects-heading">
      <div className="section-header">
        <h2 id="projects-heading">Projects</h2>
        <p>Showcasing my work and contributions across various technologies and domains.</p>
      </div>

      <div className="projects-container">
        <div className="projects-placeholder">
          <h3>Coming Soon</h3>
          <p>Projects will be added here shortly. Stay tuned for an exciting showcase of my work!</p>
        </div>
      </div>
    </section>
  )
}
