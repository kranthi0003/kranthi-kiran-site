
# kranthi-kiran-site

Personal portfolio site for Kranthi Kiran. This repository contains a modernized, componentized React + Vite version of the original static site plus a static backup (`index.static.html`). The site focuses on a clean, accessible, and responsive single-page experience (Hero + Journey), with a theme toggle, skip-link, and reveal animations.

Key contents

- `index.html` — Vite entry (loads `src/main.jsx`)
- `index.static.html` — Backup of the original static page
- `src/` — React source (components: `Navbar`, `Hero`, `Journey`, `Footer`, `BackToTop`, plus `App.jsx`)
- `style.css` — Global stylesheet with design tokens and component rules
- `assets/` — Images, resume PDF, and favicons
- `CNAME` — Custom domain configuration (if used)

Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Run development server (Vite)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

What changed / features

- Migrated the original static page into a Vite + React app for faster iteration.
- Added a theme toggle (light/dark) with persisted preference.
- Improved accessibility: skip link (hidden until focus), keyboard focus outlines, anchor scroll padding, and ARIA landmarks.
- Unifying design tokens in `style.css` (colors, spacing, shadows, radii).
- Reveal animations for Journey nodes and a floating socials/footer UI.

Notes about deployment

- GitHub Pages: you can deploy the `dist` output from `vite build` to GitHub Pages. A simple approach is to use the `gh-pages` branch or configure GitHub Actions to build and deploy automatically.
- If you'd like, I can add a GitHub Actions workflow that builds and publishes to Pages on push to `main`.

Next steps I can do for you

- Run the dev server and verify the build locally (I can run it here and share logs).
- Clean up leftover temporary artifacts and remove `index.static.html` if you no longer need the backup.
- Add a small CI workflow to build on push and optionally deploy to GitHub Pages.

If you want me to push the cleaned repository to your GitHub account, tell me which remote name or repository URL to use (I will push only after you confirm).

