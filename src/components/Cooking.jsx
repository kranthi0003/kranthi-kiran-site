import React from 'react'

export default function Cooking() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <i className="fa-solid fa-utensils"></i>
        <h1>Cooking</h1>
        <p>Recipes, cooking tips, and culinary adventures</p>
      </div>

      <div className="feature-content">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h2>Coming Soon!</h2>
          <p>Cooking hub with recipes and culinary tips is under development. Get ready to cook!</p>
          <div className="feature-details">
            <p>👨‍🍳 Easy recipes</p>
            <p>🍳 Cooking tips & tricks</p>
            <p>🌶️ Culinary adventures</p>
          </div>
        </div>
      </div>
    </div>
  )
}
