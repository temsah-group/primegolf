# Prime Gulf Advisory – Website

Bilingual (English / Arabic) marketing site for Prime Gulf Advisory, a UAE business-setup consultancy.

Built with **React + Vite**, **Motion** for animations and **Three.js** for the 3D globe in the hero.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

The static site is written to `dist/` and can be hosted on any static host (Vercel, Netlify, cPanel, etc.).

## Where things live

| Path | What it is |
|---|---|
| `src/content.js` | All site text (EN + AR), prices, WhatsApp numbers and image links — edit copy here |
| `src/components/Sections.jsx` | Main page sections (nav, hero, about, services, pricing, FAQ, footer…) |
| `src/components/Extras.jsx` | Mainland vs Free Zone table, cost calculator, contact/quote form, mobile bar |
| `src/components/Preview.jsx` | "See your company" 3D preview card |
| `src/components/Assistant.jsx` | Chat-style setup assistant that sends a summary to WhatsApp |
| `src/components/Globe.jsx` | Three.js globe (lazy-loaded) |
| `src/components/HeroBg.jsx` | Animated hero background |
| `src/index.css` | All styles |
| `src/data/land-dots.json` | Pre-computed land points for the globe |
| `static-version/` | Earlier plain HTML/CSS version, kept for reference |

## Notes

- Photos are free-licence images loaded from Unsplash; partner logos load from the current primegulfadvisory.com site. Move both into the project before the old site goes offline.
- The language choice is remembered per visitor (localStorage). Visitors who prefer reduced motion get a static version.
