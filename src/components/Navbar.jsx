import React from 'react'

export default function Navbar({ theme = 'dark', toggleTheme, active = 'home', navigate }){
  // icon shows the action to switch TO the other theme (opposite of current)
  const iconClass = theme === 'light' ? 'fa-moon' : 'fa-sun'
  const ariaLabel = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
  const ariaPressed = theme === 'light' ? 'true' : 'false'

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
  <div className="nav-left"><a href="#top">Kranthi Kiran</a></div>
        <div className="nav-right">
          <a href="#top" className={active === 'home' ? 'active' : ''} aria-current={active === 'home' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/"); }}>Home</a>
          <a href="#resume" className={active === 'journey' ? 'active' : ''} aria-current={active === 'journey' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate("/#resume"); }}>Journey</a>
          <a href="/photography" onClick={e => { e.preventDefault(); navigate("/photography"); }}>Photography</a>
          <a href="/cryto" onClick={e => { e.preventDefault(); navigate("/cryto"); }}>Cryto</a>
          <button id="themeToggle" className="theme-btn" aria-label={ariaLabel} aria-pressed={ariaPressed} onClick={toggleTheme}>
            <i className={`fa-solid ${iconClass}`} aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </nav>
  )
}
