import React, { useEffect, useState } from 'react'

export default function BackToTop(){
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > (window.innerHeight * 0.5))
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (!visible) return null
  return (
    <button className="back-to-top" onClick={goTop} aria-label="Back to top">
      <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
  )
}
