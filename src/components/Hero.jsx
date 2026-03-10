import React, { useState } from 'react'
import profile from '../../assets/profile.png'
import SkillsModal from './SkillsModal'

export default function Hero(){
  const [showSkills, setShowSkills] = useState(false)

  return (
  <>
    <section id="top" className="hero">
      <div className="hero-text">
        <h1>Hey, I'm Kranthi.</h1>
        <p className="tagline">Building scalable systems & solving complex problems</p>
        <p>
          <span 
            className="skill-trigger"
            onClick={() => setShowSkills(true)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowSkills(true)
              }
            }}
            role="button"
            tabIndex={0}
            title="Click to see skills"
          >
            Cloud Engineer
          </span>
          {' '}with 4+ years of experience building production-grade systems at Amazon, Couchbase, and GitHub.
        </p>
        <p>I specialize in distributed systems, performance optimization, and creating reliable infrastructure that handles scale.</p>
      </div>

      <div className="hero-image">
        <div className="image-frame">
          <img id="profileImage" src={profile} alt="Portrait of Kranthi Kiran, backend engineer" loading="lazy" />
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-icon">
          <div className="scroll-wheel"></div>
          <p>Scroll to explore</p>
        </div>
      </div>
    </section>

    {showSkills && <SkillsModal onClose={() => setShowSkills(false)} />}
  </>
  )
}
