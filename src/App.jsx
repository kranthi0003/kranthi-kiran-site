import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CompanyLogos from './components/CompanyLogos'
import QuickStats from './components/QuickStats'
import FeaturedPreview from './components/FeaturedPreview'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Cryto from './components/Cryto'
import Photography from './components/Photography'
import News from './components/News'
import F1 from './components/F1'
import Fashion from './components/Shopping'
import Travel from './components/Travel'
import Cooking from './components/Cooking'
import Cricket from './components/Cricket'
import Gaming from './components/Gaming'
import Music from './components/Music'
import Journey from './components/Journey'
import Projects from './components/Projects'
import HalvingTracker from './components/HalvingTracker'

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [route, setRoute] = useState(window.location.pathname + window.location.hash)

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
    setTimeout(() => {
      if (path === "/" || path === "" || path === "/photography" || path === "/cryto" || path === "/wallet") {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (path.includes('#')) {
        const hash = path.split('#')[1]
        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }, 0)
  }

  useEffect(() => {
    if (route === '/cryto') {
      setActiveSection('cryto')
    } else if (route === '/photography') {
      setActiveSection('photography')
    } else if (route === '/news') {
      setActiveSection('news')
    } else if (route === '/f1') {
      setActiveSection('f1')
    } else if (route === '/fashion') {
      setActiveSection('fashion')
    } else if (route === '/travel') {
      setActiveSection('travel')
    } else if (route === '/cooking') {
      setActiveSection('cooking')
    } else if (route === '/cricket') {
      setActiveSection('cricket')
    } else if (route === '/gaming') {
      setActiveSection('gaming')
    } else if (route === '/music') {
      setActiveSection('music')
    } else if (route === '/journey') {
      setActiveSection('journey')
    } else if (route === '/projects') {
      setActiveSection('projects')
    } else if (route === '/wallet') {
      setActiveSection('wallet')
    } else {
      setActiveSection('home')
    }
  }, [route])

  useEffect(() => {
    const handleScroll = () => {
      if (route !== "/" && route !== "") {
        return
      }
      setActiveSection("home")
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [route])

  return (
    <div>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar active={activeSection} navigate={navigate} />
      <main id="main">
        <div className="container">
          {route === "/cryto" ? (
            <Cryto />
          ) : route === "/photography" ? (
            <Photography />
          ) : route === "/news" ? (
            <News />
          ) : route === "/f1" ? (
            <F1 />
          ) : route === "/fashion" ? (
            <Fashion />
          ) : route === "/travel" ? (
            <Travel />
          ) : route === "/cooking" ? (
            <Cooking />
          ) : route === "/cricket" ? (
            <Cricket />
          ) : route === "/gaming" ? (
            <Gaming />
          ) : route === "/music" ? (
            <Music />
          ) : route === "/journey" ? (
            <Journey />
          ) : route === "/projects" ? (
            <Projects navigate={navigate} />
          ) : route === "/wallet" ? (
            <HalvingTracker />
          ) : (
            <>
              <Hero id="top" navigate={navigate} />
              <CompanyLogos />
              <QuickStats />
              <FeaturedPreview navigate={navigate} />
            </>
          )}
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}
