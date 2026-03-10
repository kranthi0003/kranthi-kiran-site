import React from 'react'

export default function ConnectSection() {
  const socials = [
    { name: 'GitHub', icon: 'fa-brands fa-github', url: 'https://github.com/kranthi0003' },
    { name: 'LinkedIn', icon: 'fa-brands fa-linkedin', url: 'https://linkedin.com/in/kranthi-kiran' },
    { name: 'Twitter', icon: 'fa-brands fa-x-twitter', url: 'https://twitter.com/kranthikiran' },
    { name: 'Email', icon: 'fa-solid fa-envelope', url: 'mailto:hello@kranthikiran.com' },
  ]

  return (
    <section className="connect-section">
      <h2>Let's Connect</h2>
      <p className="connect-tagline">Got an idea? Want to collaborate? Or just wanna say hi? 👋</p>
      
      <div className="social-links">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label={social.name}
          >
            <i className={social.icon}></i>
          </a>
        ))}
      </div>
    </section>
  )
}
