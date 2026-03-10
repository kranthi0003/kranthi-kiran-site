import React from 'react'

export default function Cricket() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-cricket"></i>
        <h1>Cricket</h1>
        <p>Cricket updates, stats, and match insights</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Cricket hub with latest updates and stats is under development. Let's play!</p>
          <div className="feature-details">
            <p>🏏 Match updates & scores</p>
            <p>📊 Player stats & rankings</p>
            <p>🎙️ Cricket analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
