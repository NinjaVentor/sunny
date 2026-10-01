# SunnyToolsPro

Live widgets board — world weather, any-to-any currency conversion, 24K gold price per gram, and world time. The frontend is a single static `index.html` + `tokens.css`; all data comes from same-origin `/api/*` endpoints so third-party providers stay server-side.

## Live

https://sunnytoolspro.vercel.app

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole app — markup, styles, and client JS |
| `tokens.css` | Design tokens (light/dark) |
| `api/_lib.js` | Shared helpers for the serverless functions |
| `api/fx.js` | `GET /api/fx?base=USD` — live exchange rates |
| `api/weather.js` | `GET /api/weather?lat=..&lon=..` — current conditions |
| `api/geocode.js` | `GET /api/geocode?q=..` — place suggestions |
| `api/gold.js` | `GET /api/gold` — gold spot price (USD / troy oz) |
| `server.js` | Local dev server only — never deployed |

Upstream responses are cached in-memory for 60 seconds; API replies are `Cache-Control: no-store`.

## Local development

```sh
npm run dev
# http://localhost:8000
```

## Deploy

Linked to Vercel: every push to `main` redeploys automatically.
