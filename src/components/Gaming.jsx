import React from 'react'

export default function Gaming() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-gamepad"></i>
        <h1>Gaming</h1>
        <p>Game reviews, tips, and gaming adventures</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Gaming hub with reviews and tips is under development. Level up!</p>
          <div className="feature-details">
            <p>🎮 Game reviews & rankings</p>
            <p>🏆 Gaming tips & tricks</p>
            <p>🎯 Gaming insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}
