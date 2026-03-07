import React, { useState } from 'react'

export default function Contact(){
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e){
    e.preventDefault()
    // Basic client-side validation
    setError(null)
    if (!form.name || !form.email || !form.message) {
      setError('Please complete all fields.')
      return
    }
    setStatus('sending')
    // Placeholder: simulate send
    setTimeout(() => {
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    }, 700)
  }

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2>Contact</h2>
        <p>If you'd like to reach out, send a quick message below.</p>
        <form onSubmit={handleSubmit} className="contact-form" aria-label="Contact form">
          <label>
            <span className="label">Name</span>
            <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="Your name" />
          </label>

          <label>
            <span className="label">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input" placeholder="you@domain.com" />
          </label>

          <label>
            <span className="label">Message</span>
            <textarea name="message" rows="4" value={form.message} onChange={handleChange} required className="input" placeholder="Write a short message" />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send'}</button>
            <div className="contact-status" aria-live="polite">
              {status === 'sent' && <span className="sent-badge" role="status">Message sent ✓</span>}
              {error && <span className="contact-error">{error}</span>}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
