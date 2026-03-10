import React, { useState } from 'react'
import profile from '../../assets/profile.png'
import { Suspense } from 'react'
const SkillsModal = React.lazy(() => import('./SkillsModal'));

export default function Hero(){
  const [showSkills, setShowSkills] = useState(false)

  return (
  <>
    <section id="top" className="hero">
      <div className="hero-text">
        <h1>Hey, I'm Kranthi.</h1>
        <p className="tagline">I break things, fix them, and make them faster ⚡</p>
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
          {' '}who's spent 4+ years wrangling servers at Amazon, Couchbase, and GitHub.
        </p>
        <p>Big fan of distributed systems, making slow things go brrr, and building infra that doesn't page me at 3am.</p>
      </div>

      <div className="hero-image">
        <div className="image-frame">
          <img id="profileImage" src={profile} alt="Portrait of Kranthi Kiran, backend engineer" loading="lazy" />
        </div>
      </div>
    </section>

    {showSkills && (
      <Suspense fallback={<div style={{textAlign:'center',padding:'2em'}}>Loading skills...</div>}>
        <SkillsModal onClose={() => setShowSkills(false)} />
      </Suspense>
    )}
  </>
  )
}
