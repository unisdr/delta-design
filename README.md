# DELTA design

The DELTA design system: design tokens, guidelines and a working example page built with React Aria and Tailwind. It is the source of truth for how DELTA looks and behaves. Where Figma disagrees with DESIGN.md or tokens.json, DESIGN.md and tokens.json win.

Version 0.7.3, 12 November 2026.

## What is in this repo

- `delta-react-aria-example.html` - the example page as one file. Open it in any browser, no install needed.
- `docs/` - DESIGN.md (guidelines), tokens.json and tokens.css (design tokens). Read DESIGN.md first.
- `example-page-source/` - the React code of the example page (React Aria + Tailwind, built with Vite). To build it: `npm install`, then `npm run build`.
  - `lib/` shared components and styles (tokens.css, theme.css)
  - `src/` the screens
  - `*.cjs` accessibility checks (WCAG 2.2 AA)

## Related repo

- [delta-feature-prototypes](https://github.com/unisdr/delta-feature-prototypes) - one HTML prototype per feature, with a README and design notes, for review and testing before implementation.

## How the pieces fit

1. Design rules and tokens are agreed and documented here.
2. Feature screens are prototyped in delta-feature-prototypes and checked against these rules.
3. Approved screens are built as React code and added to the DELTA application.
4. DESIGN.md, tokens.json and tokens.css are copied read-only into the DELTA repo (`_docs/design/`). Changes are made here first.
