import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'

export default function App(){
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('home')
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

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light')
    else document.body.classList.remove('light')
    localStorage.setItem('theme', theme)
  }, [theme])

  // highlight active section as user scrolls
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id
      if (id === 'top' || id === '') setActiveSection('home')
          else if (id === 'resume') setActiveSection('journey')
        }
      })
    }, { root: null, threshold: 0.45 })

    const top = document.getElementById('top')
    const resume = document.getElementById('resume')
    if (top) obs.observe(top)
    if (resume) obs.observe(resume)
    return () => obs.disconnect()
  }, [])

  // intentionally single-page: Hero and Journey both render; navbar links use anchors (#resume)

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <div>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar theme={theme} toggleTheme={toggleTheme} active={activeSection} />
      <main id="main">
        <div className="container">
          <Hero />
          <Journey />
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}
