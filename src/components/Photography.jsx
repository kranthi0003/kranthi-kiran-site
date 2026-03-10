import React, { useState } from 'react'

const PHOTOS = [
  { id: 1, thumb: 'https://picsum.photos/id/1027/400/300', full: 'https://picsum.photos/id/1027/1600/1200', title: 'Profile / Portrait', tags: ['portrait', 'studio'], wide: false, tall: false },
  { id: 2, thumb: 'https://picsum.photos/id/1018/400/300', full: 'https://picsum.photos/id/1018/1600/1200', title: 'Landscape', tags: ['landscape', 'nature'], wide: false, tall: false },
  { id: 3, thumb: 'https://picsum.photos/id/1005/300/450', full: 'https://picsum.photos/id/1005/1200/1600', title: 'Studio Light', tags: ['portrait', 'studio'], wide: false, tall: true },
  { id: 4, thumb: 'https://picsum.photos/id/1025/400/300', full: 'https://picsum.photos/id/1025/1600/1200', title: 'Street', tags: ['street', 'travel'], wide: false, tall: false },
  { id: 5, thumb: 'https://picsum.photos/id/1011/400/300', full: 'https://picsum.photos/id/1011/1600/1200', title: 'Architecture', tags: ['architecture', 'urban'], wide: false, tall: false },
  { id: 6, thumb: 'https://picsum.photos/id/1069/500/300', full: 'https://picsum.photos/id/1069/1600/1200', title: 'Experiment', tags: ['experimental', 'creative'], wide: true, tall: false },
  { id: 7, thumb: 'https://picsum.photos/id/1033/400/300', full: 'https://picsum.photos/id/1033/1600/1200', title: 'Nature', tags: ['nature', 'landscape'], wide: false, tall: false },
  { id: 8, thumb: 'https://picsum.photos/id/1042/400/300', full: 'https://picsum.photos/id/1042/1600/1200', title: 'Urban', tags: ['urban', 'architecture'], wide: false, tall: false },
  { id: 9, thumb: 'https://picsum.photos/id/1044/400/300', full: 'https://picsum.photos/id/1044/1600/1200', title: 'Detail', tags: ['detail', 'macro'], wide: false, tall: false },
  { id: 10, thumb: 'https://picsum.photos/id/1050/400/300', full: 'https://picsum.photos/id/1050/1600/1200', title: 'Motion', tags: ['motion', 'dynamic'], wide: false, tall: false },
  { id: 11, thumb: 'https://picsum.photos/id/1051/400/300', full: 'https://picsum.photos/id/1051/1600/1200', title: 'Moment', tags: ['candid', 'travel'], wide: false, tall: false },
  { id: 12, thumb: 'https://picsum.photos/id/1052/400/300', full: 'https://picsum.photos/id/1052/1600/1200', title: 'Serenity', tags: ['nature', 'peaceful'], wide: false, tall: false },
  { id: 13, thumb: 'https://picsum.photos/id/1053/400/300', full: 'https://picsum.photos/id/1053/1600/1200', title: 'Colors', tags: ['vibrant', 'creative'], wide: false, tall: false },
  { id: 14, thumb: 'https://picsum.photos/id/1054/400/300', full: 'https://picsum.photos/id/1054/1600/1200', title: 'Focus', tags: ['focused', 'detail'], wide: false, tall: false },
  { id: 15, thumb: 'https://picsum.photos/id/1055/400/300', full: 'https://picsum.photos/id/1055/1600/1200', title: 'Depth', tags: ['depth', 'composition'], wide: false, tall: false },
  { id: 16, thumb: 'https://picsum.photos/id/1056/400/300', full: 'https://picsum.photos/id/1056/1600/1200', title: 'Light', tags: ['light', 'studio'], wide: false, tall: false },
  { id: 17, thumb: 'https://picsum.photos/id/1057/400/300', full: 'https://picsum.photos/id/1057/1600/1200', title: 'Shadow', tags: ['shadow', 'contrast'], wide: false, tall: false },
  { id: 18, thumb: 'https://picsum.photos/id/1058/400/300', full: 'https://picsum.photos/id/1058/1600/1200', title: 'Texture', tags: ['texture', 'detail'], wide: false, tall: false },
  { id: 19, thumb: 'https://picsum.photos/id/1059/400/300', full: 'https://picsum.photos/id/1059/1600/1200', title: 'Essence', tags: ['artistic', 'moody'], wide: false, tall: false },
  { id: 20, thumb: 'https://picsum.photos/id/1060/400/300', full: 'https://picsum.photos/id/1060/1600/1200', title: 'Narrative', tags: ['story', 'travel'], wide: false, tall: false },
]

export default function Photography(){
  const [selected, setSelected] = useState(null)
  const [filteredTag, setFilteredTag] = useState(null)

  const allTags = [...new Set(PHOTOS.flatMap(p => p.tags))]
  const filtered = filteredTag ? PHOTOS.filter(p => p.tags.includes(filteredTag)) : PHOTOS

  return (
    <>
    <div className="photography-page" style={{ padding: 24, minHeight: '80vh' }}>
      <h1 style={{ fontSize: 48, marginBottom: 12 }}>Photography</h1>
      <p style={{ fontSize: 18, color: '#bbb', marginBottom: 24, maxWidth: 600 }}>
        A selection of my work — click any image to view in detail. Filter by tag to explore specific themes.
      </p>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilteredTag(null)}
          style={{
            padding: '8px 14px',
            borderRadius: 20,
            background: !filteredTag ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: !filteredTag ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
            color: !filteredTag ? '#93c5fd' : '#bbb',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 160ms ease'
          }}
          onMouseEnter={(e) => !filteredTag || (e.currentTarget.style.color = '#ddd')}
          onMouseLeave={(e) => !filteredTag || (e.currentTarget.style.color = '#bbb')}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilteredTag(tag)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              background: filteredTag === tag ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
              border: filteredTag === tag ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: filteredTag === tag ? '#86efac' : '#bbb',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 160ms ease',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => filteredTag !== tag && (e.currentTarget.style.color = '#ddd')}
            onMouseLeave={(e) => filteredTag !== tag && (e.currentTarget.style.color = '#bbb')}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
        {filtered.map(photo => (
          <div
            key={photo.id}
            onClick={() => setSelected(photo)}
            role="button"
            style={{
              gridColumn: photo.wide ? 'span 2' : 'span 1',
              gridRow: photo.tall ? 'span 2' : 'span 1',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              aspectRatio: photo.wide ? '2/1' : photo.tall ? '1/2' : '1/1',
              transition: 'all 160ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <img
              src={photo.thumb}
              alt={photo.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))',
              padding: '16px 12px',
              color: '#fff'
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{photo.title}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {photo.tags.map(tag => <span key={tag}>#{tag}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Lightbox modal */}
    {selected && (
      <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
        <div onClick={() => setSelected(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
        <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', zIndex: 70 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: -40,
              right: 0,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              fontWeight: 300
            }}
          >
            ✕
          </button>
          <img
            src={selected.full}
            alt={selected.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
            padding: '20px',
            color: '#fff'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.title}</div>
            <div style={{ fontSize: 13, color: '#bbb', marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selected.tags.map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, textTransform: 'capitalize' }}>
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={selected.full}
              download
              style={{
                display: 'inline-block',
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 6,
                background: 'rgba(59,130,246,0.2)',
                border: '1px solid rgba(59,130,246,0.4)',
                color: '#93c5fd',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 160ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.3)'
                e.currentTarget.style.color = '#bfdbfe'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.2)'
                e.currentTarget.style.color = '#93c5fd'
              }}
            >
              ⤓ Download
            </a>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
