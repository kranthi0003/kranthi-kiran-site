import React from 'react'

export default function Fashion() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-shirt"></i>
        <h1>Fashion</h1>
        <p>Style, trends, and fashion insights</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Fashion hub with curated style tips is under development. Stay tuned!</p>
          <div className="feature-details">
            <p>� Fashion trends & tips</p>
            <p>💰 Style recommendations</p>
            <p>⭐ Fashion inspiration</p>
          </div>
        </div>
      </div>
    </div>
  )
}
