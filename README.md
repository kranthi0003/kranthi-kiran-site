
# Kranthi Kiran

Personal portfolio site for Kranthi Kiran. A modern, fully-featured React + Vite single-page application featuring a home page with professional journey, interactive photography gallery, and a live crypto dashboard with real-time market data.

## Features

- **Home Page** — Hero section and professional journey timeline with smooth animations
- **Photography Gallery** — Interactive image gallery with tag filtering and lightbox modal (20+ photos)
- **Cryto Dashboard** — Live cryptocurrency price tracker showing 6 top coins with:
  - Real-time price data from CoinGecko API
  - 7-day sparkline charts with trend visualization
  - 24h, 30-day, and 1-year percentage changes
  - Interactive modal with detailed coin information
  - Integrated calculators: Convert (USD/INR), ROI/P&L, and DCA (Dollar-Cost Averaging)
- **Theme Toggle** — Light/dark mode with persisted user preference
- **Responsive Design** — Mobile-first, works great on all devices
- **Accessibility** — Skip links, keyboard navigation, ARIA landmarks

## Project Structure

```
kranthi-kiran-site/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         — Navigation with SPA routing
│   │   ├── Hero.jsx           — Hero section with intro
│   │   ├── Journey.jsx        — Professional journey timeline
│   │   ├── Photography.jsx    — Photo gallery with filtering
│   │   ├── Cryto.jsx          — Crypto dashboard with live data
│   │   ├── Footer.jsx         — Footer with social links
│   │   ├── BackToTop.jsx      — Scroll-to-top button
│   │   └── App.jsx            — Main app with SPA routing
│   ├── main.jsx               — React entry point
│   └── style.css              — Global styles and design tokens
├── assets/                    — Images, icons, resume PDF
├── index.html                 — Vite entry point
├── vite.config.js             — Vite configuration
└── package.json               — Dependencies and scripts
```

## Tech Stack

- **React 18** — UI components and state management
- **Vite** — Fast build tool and dev server
- **CoinGecko API** — Live crypto market data
- **CSS3** — Responsive design with CSS Grid/Flexbox
- **JavaScript ES6+** — Modern JavaScript features

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start dev server** (hot reload at `http://localhost:5173`)
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Data Sources

- **Crypto Data** — CoinGecko Public API (free, no auth required)
  - Markets endpoint for top coins with 24h/30d/1y changes and sparklines
  - Simple price endpoint as fallback with proxy support
  - Full historical data for coin details
- **Images** — Placeholder images (photography page uses sample photos from external service)
- **Portfolio Data** — Hardcoded in components (journey timeline, project info, etc.)

## API Features & Resilience

The Cryto dashboard includes:
- **Retry logic** — 3 attempts with exponential backoff (500ms → 1000ms → 2000ms)
- **Proxy fallbacks** — Public proxies (AllOrigins, CodeTabs) if direct fetch fails
- **Fallback endpoint** — Uses simple price endpoint if market data unavailable
- **Rate-limit handling** — Graceful degradation, caches data for 10 minutes between requests
- **CORS support** — Handles browser CORS restrictions with proxy services

## Customization

### Colors & Theme
Edit `style.css` for global design tokens. Component-level styles use inline styles for rapid iteration.

### Coins in Crypto Dashboard
Edit the `COINS` array in `src/components/Cryto.jsx`:
```javascript
const COINS = ['bitcoin','ethereum','cardano','solana','ripple','tether']
```

### Photography Gallery
Update the `PHOTOS` array in `src/components/Photography.jsx` with new image URLs and metadata.

### Update Frequency
- **Crypto data** — Refreshes every 10 minutes (configurable in `Cryto.jsx`)
- **UI updates** — Instant on user interaction (filters, calculators, etc.)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The site is built for static hosting:
1. Run `npm run build` to create a `dist/` folder
2. Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, etc.)
3. Configure your domain/CNAME if needed

## License

Personal portfolio — all rights reserved.
