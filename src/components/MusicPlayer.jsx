import React, { useEffect, useRef, useState } from 'react';

// The player will only use a curated playlist provided at `/assets/music/playlist.json`.
// If that file is missing or empty, the player will remain idle and will not play
// any fallback or remote tracks. This enforces strict playback of only the user-provided list.
const DEFAULT_TRACKS = [];

export default function MusicPlayer({ className = '' }){
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(null);
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [playlistLoaded, setPlaylistLoaded] = useState(false);

  function getTrackTitle(idx){
    if (idx === null || !tracks || !tracks[idx]) return '';
    const t = tracks[idx];
    try {
      const u = new URL(t, window.location.origin);
      const parts = u.pathname.split('/');
      let name = parts.pop() || u.pathname;
      name = decodeURIComponent(name).replace(/[-_]/g, ' ');
      // strip extension
      name = name.replace(/\.[^/.]+$/, '');
      // title case small words
      name = name.split(' ').map(w => w.length ? (w[0].toUpperCase() + w.slice(1)) : w).join(' ');
      return name;
    } catch(e){
      // fallback: try to remove query and extension
      try {
        let s = String(t).split('?')[0];
        s = s.replace(/\.[^/.]+$/, '');
        s = s.split('/').pop();
        s = decodeURIComponent(s).replace(/[-_]/g,' ');
        s = s.split(' ').map(w => w.length ? (w[0].toUpperCase() + w.slice(1)) : w).join(' ');
        return s;
      } catch(_) {
        return String(t);
      }
    }
  }

  // Try to fetch a curated playlist from /assets/music/playlist.json (optional)
  useEffect(() => {
    let cancelled = false;
    fetch('/assets/music/playlist.json', { cache: 'no-cache' }).then(res => {
      if (!res.ok) throw new Error('no playlist');
      return res.json();
    }).then(list => {
      if (cancelled) return;
      if (Array.isArray(list) && list.length > 0) {
        // Load the curated playlist but DO NOT auto-play on load/refresh.
        setTracks(list);
        setPlaylistLoaded(true);
        // Keep trackIndex null so playback only starts after an explicit user action
        setTrackIndex(null);
      } else {
        // empty or invalid playlist -> ensure player is idle and no sources are used
        setTracks([]);
        setPlaylistLoaded(false);
        try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } } catch(_){}
      }
    }).catch(() => {
      // playlist not available -> keep player idle
      if (!cancelled) {
        setTracks([]);
        setPlaylistLoaded(false);
        try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } } catch(_){}
      }
    });
    return () => { cancelled = true };
  }, []);

  // Note: we intentionally do not auto-start playback here. If a playlist is
  // available and the user previously opted-in, playback is handled inside the
  // playlist fetch handler above to guarantee we only play playlist tracks.

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      // play next track in sequence on end
      playNext();
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  function playNext(){
    if (!tracks || tracks.length === 0) return;
    // determine next index (round-robin)
    const next = trackIndex === null ? 0 : (trackIndex + 1) % tracks.length;
    setTrackIndex(next);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[next];
    audio.load();
    const p = audio.play();
    if (p && p.catch) p.catch(() => {/* ignore autoplay errors */});
    setIsPlaying(true);
    localStorage.setItem('siteMusicEnabled','true');
  }

  function playPrev(){
    if (!tracks || tracks.length === 0) return;
    const prev = trackIndex === null ? (tracks.length - 1) : ( (trackIndex - 1 + tracks.length) % tracks.length );
    setTrackIndex(prev);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[prev];
    audio.load();
    const p = audio.play();
    if (p && p.catch) p.catch(() => {/* ignore autoplay errors */});
    setIsPlaying(true);
    localStorage.setItem('siteMusicEnabled','true');
  }

  function startRandomTrack(){
    // start playback: if a track is already selected, resume it; otherwise start at 0
    if (trackIndex === null) {
      playNext();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {/* ignore */});
    setIsPlaying(true);
    localStorage.setItem('siteMusicEnabled','true');
  }

  function toggle(){
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      localStorage.setItem('siteMusicEnabled','false');
    } else {
      // start or resume
      if (!audio.src || audio.ended) {
        // no current src or the previous track ended — start next/first
        playNext();
      } else {
        // resume current track where it was paused
        const p = audio.play();
        if (p && p.catch) p.catch(() => {/* ignore */});
        setIsPlaying(true);
        localStorage.setItem('siteMusicEnabled','true');
      }
    }
  }

  return (
    <div className={`music-player pill simple ${className}`} role="region" aria-label="Background music player">
      <audio ref={audioRef} preload="metadata" />

      {/* unified pill: icon + label + subtle visualizer */}
      <button
        className={`music-pill ${isPlaying ? 'playing' : 'paused'}`}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={isPlaying ? 'Pause music' : 'Play music'}
        onClick={toggle}
      >
        <span className="pill-icon" aria-hidden>
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="4" width="4" height="16" fill="currentColor" />
              <rect x="15" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
            </svg>
          )}
        </span>

        <span className="pill-label">Music</span>

        <span className="pill-viz" aria-hidden>
          <i style={{'--d': '0.14s'}}></i>
          <i style={{'--d': '0.20s'}}></i>
          <i style={{'--d': '0.12s'}}></i>
        </span>
      </button>
    </div>
  );
}
