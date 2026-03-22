import React from 'react'
import MusicPlayer from './MusicPlayer'

export default function Navbar({ active = 'home', navigate }){
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="/" className="nav-logo-text" aria-label="Kranthi Kiran" onClick={e => { e.preventDefault(); navigate("/"); }}>
            <svg className="kk-logo" viewBox="0 0 100 100" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c4dff" />
                  <stop offset="60%" stopColor="#00d4ff" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              { /* circular badge */ }
              <circle cx="50" cy="50" r="36" fill="none" stroke="url(#g1)" strokeWidth="2.4" />
              { /* main text - centered */ }
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" alignmentBaseline="central" fontFamily="'Exo 2', sans-serif" fontWeight="700" fontSize="24" fill="#fff">KK</text>
            </svg>
            <span className="sr-only">Kranthi Kiran</span>
          </a>
          <a href="/">Kranthi Kiran</a>
        </div>
        <div className="nav-right">
          <a href="/" className={active === 'home' ? 'active' : ''} aria-current={active === 'home' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/"); }}>Home</a>
          <a href="/journey" className={active === 'journey' ? 'active' : ''} aria-current={active === 'journey' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/journey"); }}>Career</a>
          <a href="/projects" className={active === 'projects' ? 'active' : ''} aria-current={active === 'projects' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/projects"); }}>Projects</a>
          <a href="/crypto" className={active === 'crypto' ? 'active' : ''} aria-current={active === 'crypto' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/crypto"); }}>Crypto</a>
          <MusicPlayer />
        </div>
      </div>
    </nav>
  )
}
