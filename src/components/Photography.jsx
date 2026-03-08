import React from 'react'

export default function Photography(){
  return (
    <section id="photography" className="photo-section">
      <div className="container">
        <div className="section-header">
          <h2>Photography</h2>
          <p className="lead" style={{maxWidth:600, margin: '12px auto 0'}}>I enjoy shooting with my Sony camera — here are some recent photos. Click any image to open the full version.</p>
        </div>

        <div className="photo-gallery">
          <figure className="photo-item">
            <a href="/assets/profile.jpg" target="_blank" rel="noreferrer">
              <img src="/assets/profile.jpg" alt="Sample photo 1" />
            </a>
            <figcaption>Sample 1</figcaption>
          </figure>

          <figure className="photo-item">
            <a href="/assets/profile.png" target="_blank" rel="noreferrer">
              <img src="/assets/profile.png" alt="Sample photo 2" />
            </a>
            <figcaption>Sample 2</figcaption>
          </figure>

          <figure className="photo-item">
            <a href="/assets/aws.png" target="_blank" rel="noreferrer">
              <img src="/assets/aws.png" alt="Sample photo 3" />
            </a>
            <figcaption>Sample 3</figcaption>
          </figure>

          <figure className="photo-item">
            <a href="/assets/groww.png" target="_blank" rel="noreferrer">
              <img src="/assets/groww.png" alt="Sample photo 4" />
            </a>
            <figcaption>Sample 4</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
