# SunnyToolsPro

Your Everyday Digital Toolkit — free online tools, converters, and live UAE information. A dependency-free static site (vanilla HTML, CSS, and JavaScript) backed by same-origin serverless API routes, so third-party providers stay server-side.

## Features

- **17 free tools** — PDF converters and editors (JPG/PNG/Text/Word to PDF, PDF to JPG/Word, merge, split, compress), image tools (compress, resize, crop), calculators (currency, UAE VAT, age, unit), and a Qibla finder. File tools process everything locally in the browser; nothing is uploaded.
- **Live UAE dashboard** — prayer times with countdown, currency converter, job listings, room-rent finder, gold price, fuel prices, USD reference rate, Sharjah weather, and UAE news headlines.
- **Jobs and room-rent pages** — searchable live listings with filters, pagination, official rent averages, and free listing via email.
- **Blog and guides** — how-to articles with Article JSON-LD, plus FAQ JSON-LD on tool and listing pages.
- **Theming and responsive UI** — dark/light mode persisted in local storage, mobile-first layouts, Outfit typeface, inline SVG icon set.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html`, `jobs.html`, `rooms.html` | Hand-maintained pages: markup, live widgets, and client JS |
| `tools.html`, `blog.html`, `about.html`, `contact.html`, legal pages | Generated output — do not hand-edit |
| `tools/*.html`, `blog/*.html` | Generated tool and article pages |
| `content/` | Source data for the generator (`site.js`, `tools1.js`, `tools2.js`, `blog.js`, `legal.js`) |
| `scripts/generate.cjs` | Static site generator — rebuilds every generated page, `sitemap.xml`, and `robots.txt` |
| `tokens.css` | Shared design tokens and layout CSS |
| `api/` | Serverless handlers (Vercel-style): `fx`, `weather`, `geocode`, `gold` |
| `functions/api/` | Serverless handlers (Pages-style): `fx`, `weather`, `geocode`, `gold`, `jobs`, `news`, `fuel`, `dld-rents`, `pf-rooms` |
| `data/` | Snapshots refreshed by automation (`jobs.json`, `fuel.json`) |
| `scripts/` | Generator, audits, and test harnesses |
| `server.js` | Local dev server only — never deployed |
| `404.html`, `favicon.svg`, `robots.txt`, `sitemap.xml` | Production site assets |

## Local development

```sh
npm run dev
```

Then open the printed local address in a browser. The dev server serves static files with clean URLs (`/jobs`, `/tools/vat-calculator`) and bridges `/api/*` to the serverless handlers.

## Editing content

1. Edit files in `content/` (tool copy, blog posts, legal text, navigation).
2. Regenerate the site:

```sh
node scripts/generate.cjs
```

3. Verify before committing:

```sh
node scripts/verify-tools.cjs
node scripts/runtime-test.cjs
node scripts/audit.cjs
```

Tool pages must stay above 600 words each or the generator exits non-zero. Widget markup inside `widgetHTML` in `scripts/generate.cjs` must keep its element IDs — the test harnesses and client logic depend on them.

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/fx?base=USD` | Live exchange rates |
| `GET /api/weather?lat=..&lon=..` | Current conditions |
| `GET /api/geocode?q=..` | Place suggestions |
| `GET /api/gold` | Gold spot price (USD per troy ounce) |
| `GET /api/jobs?count=..&industry=..&tag=..` | Remote job listings |
| `GET /api/news` | Latest UAE headlines |
| `GET /api/fuel` | Monthly UAE fuel prices |
| `GET /api/dld-rents` | Official Dubai average rents |
| `GET /api/pf-rooms?city=..&page=..` | Property listings |

Upstream responses are cached briefly; API replies carry explicit cache headers. The homepage refreshes weather, gold, and rates every 5 minutes, news every 10 minutes, and fuel every 30 minutes.

## Deployment

Every push to `main` redeploys automatically through the connected hosting provider. Generated files (`tools/*.html`, `blog/*.html`, `sitemap.xml`, `robots.txt`, `404.html`) are committed to the repo, so no build step runs in production.

## Notes

- `server.js`, `content/`, `scripts/`, `api/`, and `functions/` sources are never served as pages; the dev server blocks them.
- Contact and support: see the contact page on the site.
