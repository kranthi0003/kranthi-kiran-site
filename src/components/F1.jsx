import React from 'react'

export default function F1() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-flag-checkered"></i>
        <h1>F1 Hub</h1>
        <p>Formula 1 insights, stats, and race updates</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>F1 content hub is under development. Buckle up for exciting F1 insights!</p>
          <div className="feature-details">
            <p>🏎️ Race schedules & results</p>
            <p>📊 Driver standings & stats</p>
            <p>🎙️ Race highlights & analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
