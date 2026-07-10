# Robots Explorer

Enter any website URL and see exactly what its `robots.txt` tells crawlers:
which user-agents have rules, which paths are allowed or disallowed, any
sitemap URLs, and a plain-English explanation of every rule.

```
┌───────────────────────────────┐
│  https://example.com          │   →  GET /api/diagnostics/robots?url=...
└───────────────────────────────┘
```

## Project structure

```
robots-explorer/
├── backend/                    Express REST API
│   ├── src/
│   │   ├── app.js              Express app assembly (middleware, routes, static serving)
│   │   ├── server.js           Entry point (just starts the app)
│   │   ├── routes/
│   │   │   └── diagnostics.js  Thin HTTP layer - validates input, calls a diagnostic, shapes the response
│   │   ├── diagnostics/
│   │   │   ├── registry.js     Maps a diagnostic name ("robots") to its runner - the extension point
│   │   │   └── robots/
│   │   │       ├── fetcher.js    I/O only: fetch robots.txt, handle timeouts/redirects/HTTP errors
│   │   │       ├── parser.js     Pure logic: robots.txt text -> structured groups/rules/sitemaps
│   │   │       ├── explainer.js  Pure logic: structured data -> plain-English descriptions
│   │   │       └── index.js      Orchestrates fetcher -> parser -> explainer into one API response
│   │   ├── utils/
│   │   │   ├── httpClient.js   Shared fetch-with-timeout-and-redirects, reusable by future diagnostics
│   │   │   └── validateUrl.js  Normalizes/validates whatever URL the user types
│   │   └── middleware/
│   │       └── errorHandler.js
│   └── package.json
├── frontend/                   React + Vite + Tailwind SPA
│   └── src/
│       ├── App.jsx
│       ├── api/diagnosticsApi.js
│       └── components/         SearchBar, StatusBanner, UserAgentCard, SitemapCard, RawRobotsPanel, Collapsible, RuleChip
├── Dockerfile                  Multi-stage: build frontend -> install backend -> single runtime image
├── docker-compose.yml          One-command local run of the built image
└── render.yaml                 Render.com deployment blueprint
```

**Why it's structured this way:** the parsing logic (`parser.js`, `explainer.js`)
has zero knowledge of HTTP, Express, or the network - it's pure functions
over strings/objects. The network logic (`fetcher.js`, `httpClient.js`) has
zero knowledge of robots.txt syntax. The route layer (`routes/diagnostics.js`)
just validates input and calls whatever's registered in `registry.js`. That
means adding a new diagnostic later - security headers, sitemap validation,
SSL checks - is just:

1. Create `backend/src/diagnostics/<name>/` with its own fetcher/parser/explainer.
2. Export one `run<Name>Diagnostic(site)` function from its `index.js`.
3. Add one line to `registry.js`.

No changes needed to routing, error handling, or the frontend's fetch layer
(`GET /api/diagnostics/:type?url=...` already works for any registered type).

## Running locally

Requires Node.js 18+ (for native `fetch`).

**1. Backend** (in one terminal):
```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3001
```

**2. Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173`. Vite's dev server proxies `/api/*` requests to
the backend on port 3001 (see `frontend/vite.config.js`), so the frontend
code always just calls relative `/api/...` URLs, in dev and in production alike.

### Running the production build with Docker

```bash
docker compose up --build
```

This builds the frontend, bundles it with the backend into a single image,
and serves everything (API + static SPA) from `http://localhost:3001`.

Or without compose:
```bash
docker build -t robots-explorer .
docker run -p 3001:3001 robots-explorer
```

## Deploying to Render

`render.yaml` defines a single Docker web service. In the Render dashboard,
choose **New > Blueprint**, point it at this repo, and Render will build the
included `Dockerfile` and wire up the health check at `/api/health`.

## API reference

### `GET /api/health`
Liveness check. Returns `{ "status": "ok" }`.

### `GET /api/diagnostics`
Lists available diagnostic types, e.g. `{ "available": ["robots"] }`.

### `GET /api/diagnostics/robots?url=<website>`
Fetches and parses `robots.txt` for the given site. `url` can be a bare
domain (`example.com`) or a full URL; it's normalized to an origin
(`https://example.com`) before fetching.

**Success response** (robots.txt exists):
```jsonc
{
  "diagnostic": "robots",
  "site": "https://example.com",
  "robotsUrl": "https://example.com/robots.txt",
  "exists": true,
  "redirected": false,
  "statusCode": 200,
  "groups": [
    {
      "userAgents": ["*"],
      "summary": "All crawlers (*) has 2 blocked paths and 1 explicitly allowed path.",
      "rules": [
        { "type": "disallow", "value": "/admin", "explanation": "Blocks All crawlers (*) from crawling any URL whose path starts with \"/admin\"." }
      ]
    }
  ],
  "sitemaps": ["https://example.com/sitemap.xml"],
  "overallSummary": "This robots.txt defines 1 rule group and lists 1 sitemap.",
  "unknownLines": [],
  "rawContent": "User-agent: *\nDisallow: /admin\n..."
}
```

**When robots.txt doesn't exist, or something goes wrong**, `exists` is
`false` and a `reason` explains why:

| `reason`             | Meaning                                                        |
|----------------------|-----------------------------------------------------------------|
| `not_found`           | Server returned 404 (or another status treated as "no file")   |
| `server_error`        | Server returned a 5xx error                                     |
| `timeout`             | Request took too long (8s limit)                                 |
| `too_many_redirects`  | More than 5 redirect hops                                        |
| `network_error`       | DNS failure, connection refused, etc.                           |

**Invalid input** returns HTTP 400: `{ "error": "invalid_url", "message": "..." }`.

## Notes on edge cases handled

- **Redirects** are followed manually (up to 5 hops) so the UI can show the
  final URL that actually served the file, and infinite redirect loops
  can't hang the request.
- **Timeouts**: every outbound request is aborted after 8 seconds.
- **Invalid URLs**: bare domains are assumed `https://`; unsupported
  protocols and malformed input are rejected with a clear message before any
  network call is made.
- **Missing robots.txt**: a 404/410 is reported as "does not exist" rather
  than an error; a 5xx is reported as "temporarily unreachable" - these are
  surfaced differently in the UI.
- **Malformed robots.txt**: unrecognized lines are collected (not silently
  dropped and not fatal) and empty/comment-only files are still parsed to an
  explicit "no rules found" result rather than throwing.
