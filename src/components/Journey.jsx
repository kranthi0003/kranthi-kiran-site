import React, { useEffect, useRef } from 'react'
import awsLogo from '../../assets/aws.png'
import growwLogo from '../../assets/groww.png'
import couchbaseLogo from '../../assets/couchbase.png'
import githubLogo from '../../assets/github.png'

const Node = ({src, title, company, years, current, style}) => (
  <div className={`journey-node ${current? 'current':''}`} style={style}>
    <img src={src} className="logo" alt={`${company} logo`} loading="lazy" />
    <h3>{title}</h3>
    <p>{company}</p>
    <span>{years}</span>
  </div>
)

export default function Journey(){
  const containerRef = useRef(null)

  useEffect(() => {
    const nodes = containerRef.current ? containerRef.current.querySelectorAll('.journey-node') : []
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view')
      })
    }, { threshold: 0.15 })
    nodes.forEach((n, i) => {
      n.style.transitionDelay = `${i * 120}ms`
      io.observe(n)
    })
    return () => io.disconnect()
  }, [])

  const nodes = [
    {src: awsLogo, title:'SE – 1', company:'Amazon', years:'2021 – 2024'},
    {src: growwLogo, title:'PSE – 2', company:'Groww', years:'2025'},
    {src: couchbaseLogo, title:'TSE – 2', company:'Couchbase', years:'2025 – 2026'},
    {src: githubLogo, title:'TSE – 3', company:'GitHub', years:'2026 – Present', current:true}
  ]

  return (
    <section id="resume" className="resume-section" aria-labelledby="journey-heading">
      <div className="section-header">
        <h2 id="journey-heading">Journey</h2>
        <a href="assets/Kranthi_Resume.pdf" className="resume-btn" download aria-label="Download Resume">Download Resume</a>
      </div>

      <div className="journey-flow" ref={containerRef}>
        {nodes.map((n, i) => (
          <React.Fragment key={n.title}>
            <Node {...n} />
            {i < nodes.length - 1 && <div className="flow-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
