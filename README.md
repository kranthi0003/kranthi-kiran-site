# Kranthi Kiran's Portfolio

A modern, fully-featured React + Vite single-page application (SPA) for Kranthi Kiran's personal portfolio. Features a professional backend engineer's resume with interactive sections, a live cryptocurrency dashboard, photography gallery, and personal interest pages.

## 🎯 About

Backend engineer with 4+ years of experience building production-grade systems at Amazon, Groww, Couchbase, and GitHub. Specializes in distributed systems, performance optimization, and reliable infrastructure that handles scale.

## ✨ Features

### Core Pages
- **Home** — Hero section with professional tagline and featured projects
- **Journey** — Professional timeline showcasing career progression and experiences
- **Projects** — Detailed portfolio of technical projects
- **Crypto Dashboard** — Live cryptocurrency price tracker with:
  - Real-time price data from CoinGecko API
  - 7-day sparkline charts with trend visualization
  - 24h, 30-day, and 1-year percentage changes
  - Interactive modal with detailed coin information
  - Integrated calculators: USD/INR conversion, ROI/P&L, DCA (Dollar-Cost Averaging)

### Interest Pages
- **Photography** — Interactive image gallery with tag filtering and lightbox modal
- **News** — Current news and updates section
- **Formula 1** — F1 racing content and statistics
- **Fashion/Shopping** — Fashion and style interests
- **Travel** — Travel experiences and destinations
- **Cooking** — Recipes and cooking interests
- **Cricket** — Cricket updates and statistics
- **Gaming** — Gaming interests and updates
- **Music** — Music preferences and recommendations

### Technical Features
- **Theme Toggle** — Light/dark mode with localStorage persistence
- **Responsive Design** — Mobile-first, optimized for all device sizes
- **SPA Routing** — Client-side routing with smooth transitions
- **Accessibility** — Skip links, keyboard navigation, ARIA landmarks, semantic HTML
- **Performance** — Lazy loading, optimized images, efficient API calls

## 📁 Project Structure

```
kranthi-kiran-site/
├── src/
│   ├── components/
│   │   ├── App.jsx              — Main app with SPA routing and state management
│   │   ├── Navbar.jsx           — Navigation with theme toggle
│   │   ├── Hero.jsx             — Hero section with intro and profile image
│   │   ├── Journey.jsx          — Professional timeline
│   │   ├── Projects.jsx         — Portfolio projects showcase
│   │   ├── FeaturedProjects.jsx — Featured projects on home page
│   │   ├── Cryto.jsx            — Crypto dashboard with live API data
│   │   ├── Photography.jsx      — Photo gallery with filtering
│   │   ├── News.jsx             — News section
│   │   ├── F1.jsx               — Formula 1 content
│   │   ├── Shopping.jsx         — Fashion/shopping interests
│   │   ├── Travel.jsx           — Travel content
│   │   ├── Cooking.jsx          — Cooking/recipes
│   │   ├── Cricket.jsx          — Cricket updates
│   │   ├── Gaming.jsx           — Gaming content
│   │   ├── Music.jsx            — Music section
│   │   ├── Footer.jsx           — Footer with social links
│   │   ├── Sidebar.jsx          — Mobile navigation sidebar
│   │   ├── BackToTop.jsx        — Scroll-to-top button
│   ├── main.jsx                 — React entry point
│   └── App.jsx                  — App component wrapper
├── assets/
│   ├── profile.jpg / profile.png — Profile photos
│   ├── favicon.png / favicon.svg — Site favicon
│   ├── aws.png, github.png, etc. — Company/tech logos
│   ├── Kranthi_Resume.pdf       — Resume PDF
│   ├── groww.png, couchbase.png — Company logos
├── index.html                   — HTML entry point (Vite)
├── style.css                    — Global styles and design tokens
├── vite.config.js               — Vite configuration
├── package.json                 — Dependencies and scripts
├── CNAME                        — Custom domain configuration
└── .github/workflows/
    └── deploy.yml               — GitHub Actions CI/CD pipeline
```

## 🛠 Tech Stack

- **Frontend Framework** — React 18 with Hooks
- **Build Tool** — Vite 5 (fast build, instant HMR)
- **Styling** — CSS3 (Grid, Flexbox, CSS Variables, animations)
- **APIs** — CoinGecko (crypto data), external image services
- **Deployment** — GitHub Pages with automated CI/CD
- **JavaScript** — ES6+ with modern best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn

### Local Development

1. **Clone and install**
   ```bash
   git clone https://github.com/kranthi0003/kranthi-kiran-site.git
   cd kranthi-kiran-site
   npm install
   ```

2. **Start dev server** (with hot reload)
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser

3. **Build for production**
   ```bash
   npm run build
   ```
   Creates optimized `dist/` folder

4. **Preview production build**
   ```bash
   npm run preview
   ```

## 📊 Data Sources & APIs

### Cryptocurrency Data
- **CoinGecko Public API** — Free, no authentication required
  - `/api/v3/coins/markets` — Top coins with 24h/30d/1y changes, sparklines
  - `/api/v3/simple/price` — Simple price fallback endpoint
  - Fallback proxies: AllOrigins, CodeTabs (for CORS handling)

### Resilience Features
- **Retry Logic** — 3 attempts with exponential backoff (500ms → 1000ms → 2000ms)
- **Proxy Fallbacks** — Public proxies when direct API calls fail
- **Caching** — 10-minute cache between requests to reduce API calls
- **Graceful Degradation** — Shows cached/fallback data if API unavailable
- **CORS Handling** — Proxy services for browser CORS restrictions

### Other Data
- **Images** — Profile photos, company logos, resume PDF stored in `assets/`
- **Portfolio Data** — Hardcoded in components (journey timeline, projects, etc.)

## ⚙️ Customization

### Update Theme & Colors
Edit `style.css` for global design tokens:
```css
:root {
  --bg-primary: #0a0a0a;
  --text-primary: #ffffff;
  /* ...more colors... */
}
```

### Update Crypto Coins
Edit the `COINS` array in `src/components/Cryto.jsx`:
```javascript
const COINS = ['bitcoin', 'ethereum', 'cardano', 'solana', 'ripple', 'tether']
```

### Update Photography Gallery
Edit the `PHOTOS` array in `src/components/Photography.jsx` with image URLs and metadata.

### Update Professional Journey
Edit the timeline data in `src/components/Journey.jsx` with your work experience.

### Update Projects
Edit project data in `src/components/Projects.jsx` and `src/components/FeaturedProjects.jsx`.

## 🔄 Update Frequencies

- **Crypto data** — Refreshes every 10 minutes (configurable in `Cryto.jsx`)
- **UI updates** — Instant on user interaction
- **Theme** — Persists to localStorage for instant recall on next visit

## 🌐 Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Deployment

### GitHub Pages (Current Setup)
The site is automatically deployed via GitHub Actions on every push to `main`:

1. Push code to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys
3. Site is live at custom domain via CNAME

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, GitHub Pages, or any static host
```

### Domain Configuration
- Custom domain set in `CNAME` file
- Configure DNS to point to GitHub Pages servers

## 🔧 Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build optimized production bundle
npm run preview  # Preview production build locally
```

## 📝 License

Personal portfolio — all rights reserved. Code is available for reference but not for commercial use without permission.
