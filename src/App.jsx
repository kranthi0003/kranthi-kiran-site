import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Cryto from './components/Cryto'
import Photography from './components/Photography'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('home')
  const [route, setRoute] = useState(window.location.pathname + window.location.hash)
  // initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [])

  // Listen for navigation (both popstate and hash changes)
  useEffect(() => {
    const handler = () => {
      setRoute(window.location.pathname + window.location.hash)
    }
    window.addEventListener("popstate", handler)
    window.addEventListener("hashchange", handler)
    return () => {
      window.removeEventListener("popstate", handler)
      window.removeEventListener("hashchange", handler)
    }
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, "", path)
    setRoute(path)
    // Scroll behavior based on path
    setTimeout(() => {
      if (path === "/" || path === "") {
        // Scroll to top for home
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (path.includes('#')) {
        // Scroll to hash element
        const hash = path.split('#')[1]
        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }, 0)
  }

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light')
    else document.body.classList.remove('light')
    localStorage.setItem('theme', theme)
  }, [theme])

  // Update active section based on route
  useEffect(() => {
    if (route === '/cryto' || route === '/photography') {
      setActiveSection(null)
    } else if (route.includes('#resume')) {
      setActiveSection('journey')
    } else {
      setActiveSection('home')
    }
  }, [route])

  // intentionally single-page: Hero and Journey both render; navbar links use anchors (#resume)

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <div>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar theme={theme} toggleTheme={toggleTheme} active={activeSection} navigate={navigate} />
      <main id="main">
        <div className="container">
          {route === "/cryto" ? (
            <Cryto />
          ) : route === "/photography" ? (
            <Photography />
          ) : (
            <>
              <Hero id="top" />
              <Journey id="resume" />
            </>
          )}
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}
