# Madame Wedding Design — Version C (the private magazine)

The website of **Madame Wedding Design** — a wedding design and production house.
Static site V1: semantic HTML5 + modern CSS + vanilla JS, content driven by
`/data/*.json`, clean URLs site-wide, Netlify-ready, and structured to survive a
future Next.js + Sanity migration with every route unchanged.

Brand, voice and design rules are LAW and live in [`CLAUDE.md`](CLAUDE.md),
[`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md). Heading/SEO templates
live in [`06-STRUCTURE-H1-H2-H3-SEO.md`](06-STRUCTURE-H1-H2-H3-SEO.md).

## Run locally

Any static server from the repo root works (paths are absolute, `/assets/...`):

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000/. Clean URLs (`/the-house/`) resolve because
every page is a folder with an `index.html` inside.

## Structure

```
/                     Home — threshold → film → magazine
/the-house/           The house, the standards, the founder, recognition
/services/            The three commissions (never partial / month-of)
/weddings/            Commissions index + /weddings/[slug]/ + destination hubs
/journal/             Notes on the art of hosting + /journal/[slug]/ venue articles
/press/               Media kit: stats, logo wall, world map, media enquiries
/faq/  /privacy/      Direct Q&A · the discretion manifesto
/inquire/             Enquiries — the five-step form
/admin/               Internal (noindex, robots-blocked): media & alt-text audit
/data/*.json          weddings · press · journal · media (single sources of truth)
/assets/              css · js · brand (seal, logo) · img · video · audio
```

## Add a commission

1. Create `/weddings/my-new-commission-slug/index.html` — copy an existing
   commission page and follow the template in `06-STRUCTURE-H1-H2-H3-SEO.md`
   (H1 = the place; H2 The commission / The production / Featured in;
   photographer in the meta + schema).
2. Add the entry to `data/weddings.json` (slug, couple, origin + destination
   with lat/lon for the world map, press links, keywords). The weddings index,
   destination hubs, "More weddings in…" blocks and the press-section map pick
   it up automatically.
3. Register every photo in `data/media.json` (file, page, alt EN, caption,
   keywords) — all alt text is served from there; audit it at `/admin/media/`.
4. Add the URL to `sitemap.xml`.

## Add a press feature

Add the outlet + URL to `data/press.json` (and to the logo wall markup on
`/` and `/press/` if it should appear there). Logos-as-text link out to the
actual features; drop licensed logo files in `assets/img/logos-press/` later.

## Add a journal article

Create `/journal/my-article-slug/index.html` from an existing article (venue
template: H2 Why X / What we produced here / Planning your wedding at X; H3 The
estate in brief / Featured coverage), add it to `data/journal.json`, register
images in `data/media.json`, add to `sitemap.xml`.

## Assets still to supply (TODO)

- `assets/video/hero-film.mp4` + `.webm` (15–40s loop, ≤1080p, ~6–10 MB) and
  `assets/img/hero-poster.jpg` — the hero film & poster (git-ignored; deploy
  via Netlify Large Media or host directly).
- `assets/audio/music.mp3` — optional.
- Real photography for every file registered in `data/media.json` (missing
  files render as tasteful neutral placeholders until then).
- `assets/brand/seal.svg` / `logo.svg` — engraved masters (placeholders in place).
- The Formspree form id in `assets/js/config.js` (`FORMSPREE_ENDPOINT`) —
  target hello@madamewedding.design.
- Licensed display/body typefaces (Canela / Austin / Chronicle) to replace
  Cormorant Garamond / EB Garamond.

## Deploy (Netlify)

- Publish directory: repo root. No build command.
- `_redirects` enforces trailing-slash/clean-URL consistency; `404.html` is
  picked up automatically.
- `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended and
  blocks `/admin/`; `llms.txt` introduces the house to AI assistants;
  `sitemap.xml` lists every public clean URL.

## Next.js + Sanity migration notes

- Routes are already final: `/`, `/the-house/`, `/services/`, `/weddings/`,
  `/weddings/[slug]/`, `/journal/`, `/journal/[slug]/`, `/inquire/` — port as
  App Router segments with `trailingSlash: true`; URLs must not change.
- `data/*.json` maps 1:1 to Sanity document types (`commission`, `pressItem`,
  `article`, `mediaAsset`). The media register becomes asset metadata (alt,
  caption, keywords) — keep it the single source of truth for alts.
- The enquiry form component (`assets/js/enquiry-form.js`) becomes one React
  component mounted on `/inquire/` and the home closing section; keep the
  Formspree endpoint (or move to a route handler) in one config constant.
- JSON-LD blocks port as-is; keep `llms.txt`, `robots.txt`, `_redirects`
  semantics (Netlify → `next.config` redirects).

## The Impeccable protocol

The Impeccable skill is installed at `.claude/skills/impeccable/` and reads
`PRODUCT.md` / `DESIGN.md`. On "applique git impeccable" / "apply impeccable",
run the full sequence — audit → layout → typeset → critique → harden → adapt →
optimize → polish — and list every change. Forbidden for this brand: bolder,
overdrive, delight, colorize (the design must never get louder or trendier).
