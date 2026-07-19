# DESIGN.md — Madame Wedding Design (Version C — private magazine)

These rules are LAW. Impeccable and any future session must never make this
design louder or trendier, and must never rewrite copy into marketing language.
Forbidden commands for this brand: bolder, overdrive, delight, colorize.

## Visual theme
A private magazine printed for one family. Warm ivory paper, deep ink, hairline
rules, generous vertical silence. References: Ralph Lauren, Loro Piana,
Brunello Cucinelli, Aman, Athena Calderone, Studio McGee — and the print pages
of Town & Country, AD, Tatler.

## Color palette
| Token | Value | Use |
|---|---|---|
| `--ivory` | `#F7F4EE` | Background — the paper. |
| `--ink` | `#26201A` | Text — warm ink, never pure black. |
| `--ink-50` | `rgba(38,32,26,.55)` | Secondary text (kept ≥4.5:1 where body-size). |
| `--ink-15` | `rgba(38,32,26,.16)` | Hairline rules. |
| `--hunter` | `#3D4A3A` | ONE heritage accent — thin rules, selected states, small labels. Sparingly. |
| `--threshold` | `#2C352B` | Entry overlay background only (deep hunter). |

Nothing brighter, ever. No gold, no champagne, no metallics anywhere —
especially the entry threshold (hunter + ivory ONLY).

## Typography
- Display: **Cormorant Garamond** — masthead, headlines, pull quotes.
  TODO: swap for licensed cuts (Canela / Austin / Chronicle) later.
- Body: **EB Garamond** — book-like reading comfort, 17.5px/1.75.
- Labels: small caps feel via uppercase + letterspacing (.22–.34em), 10–11px.
- Drop cap on "A letter from the house" (display face, hunter).
- Never heavy bold. Italic reserved for emotion words and signatures.

## Layout
Magazine editorial: centered masthead (brand in caps between thin horizontal
rules, nav centered beneath); asymmetric two-column spreads for commissions
(image / substantial text, alternating); pull quotes; hairline-ruled lists for
capabilities and journal; formal footer rule. Max content width 1160px; prose
column ~720px (≤75ch).

## Motion
Dignified and minimal: soft fade + ≤12px translate reveals (~1.2s ease), the
breathing "Enter" button, nothing playful, nothing that bounces or blinks.
`prefers-reduced-motion` disables everything and shows the film poster.

## Components
- Masthead header (all pages), formal ruled footer.
- Entry threshold overlay (home only): deep hunter, ivory line-work seal,
  "For those who know.", one "Enter" button.
- Hero film 100vh with sound after Enter; round sound toggle bottom-right;
  auto-mute past hero.
- Editorial spread; pull quote; hairline capability/journal rows.
- Couture form fields: transparent inputs, 1px hairline bottom borders, no
  boxes, no shadows, no rounded corners; hunter selected states; visible focus.
- Media-kit press block: stats row, logo wall on hairline rules, inline-SVG
  world map (ink line-work on ivory, hunter points), media-kit request.
