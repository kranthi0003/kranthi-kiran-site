import React from 'react'

export default function News() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-newspaper"></i>
        <h1>News Feed</h1>
        <p>Stay updated with the latest news from around the world</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>News fetching feature is under development. Check back soon for the latest updates!</p>
          <div className="feature-details">
            <p>📰 Latest headlines</p>
            <p>🔔 Real-time notifications</p>
            <p>🎯 Personalized feed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
