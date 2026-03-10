import React from 'react'

export default function Music() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-music"></i>
        <h1>Music</h1>
        <p>Music reviews, playlists, and artist insights</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Music hub with reviews and playlists is under development. Turn up the volume!</p>
          <div className="feature-details">
            <p>🎵 Music recommendations</p>
            <p>🎧 Playlist curation</p>
            <p>⭐ Artist insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}
