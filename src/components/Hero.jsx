import React from 'react'

export default function Hero(){
  return (
  <section id="top" className="hero">
      <div className="hero-text">
        <h1>Hey, I’m Kranthi.</h1>
        <p className="tagline">Backend engineering. Distributed systems. Reliability at scale.</p>
        <p>Software engineer with 4+ years of experience across cloud platforms, distributed databases, and production-critical systems.</p>
        <p>I focus on debugging complex issues, improving performance, and building systems that scale reliably.</p>
      </div>

      <div className="hero-image">
        <div className="image-frame">
          <img id="profileImage" src="assets/profile.png" alt="Portrait of Kranthi Kiran, backend engineer" loading="lazy" />
        </div>
      </div>
    </section>
  )
}
