# DELTA design

Design system and example screens for DELTA (v0.7.2, 12 November 2026).

- `delta-react-aria-example.html` - the example page as one file. Open it in any browser, no install needed.
- `docs/` - DESIGN.md (guidelines), tokens.json and tokens.css (design tokens). Read DESIGN.md first.
- `example-page-source/` - source of the example page (React Aria + Tailwind, built with Vite). To build it: `npm install`, then `npm run build`.
  - `lib/` shared components and styles (tokens.css, theme.css)
  - `src/` the screens
  - `*.cjs` accessibility checks (WCAG 2.2 AA)
