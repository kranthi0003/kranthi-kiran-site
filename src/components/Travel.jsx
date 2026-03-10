import React from 'react'

export default function Travel() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-map"></i>
        <h1>Travel Stories</h1>
        <p>Explore my adventures and travel experiences</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Travel stories and adventures are being curated. Get ready for an amazing journey!</p>
          <div className="feature-details">
            <p>✈️ Travel destinations & tips</p>
            <p>📸 Travel photography & stories</p>
            <p>🗺️ Maps & travel guides</p>
          </div>
        </div>
      </div>
    </div>
  )
}
