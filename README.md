# $PEPES

A mobile-friendly Pepe-themed landing page with the actual `@pepes_imd` profile photo, local rounded fonts, an oversized `$PEPES` hero, a faint frog illustration, and the full contract address with copy feedback. The hamburger opens working navigation. The page is static and uses Vite, semantic HTML, CSS and strict TypeScript.

## Install and develop

Use Node.js 22.12 or later and npm. The lockfile is included.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Development dependencies belong only in your local installation; they are not part of the static export or submission.

## Rebuild and preview

```sh
npm run typecheck
npm run build
npm run preview
```

The finished export is already included in `dist/`, with `dist/index.html`, JavaScript, CSS, the logo, both fonts and their license notices. Vite uses `base: './'`. Build assets and public asset URLs in the export are relative, so it can live below a gateway path or on a static/ENS host. All runtime assets are local. Content remains readable without JavaScript.

## Validate

```sh
npx playwright install chromium
npm run validate
```

The validation script starts its own temporary HTTP server, serves the real export at `/preview/`, drives Chromium, writes screenshots and results under `artifacts/`, and shuts down both browser and server. It validates five viewport sizes, the exact clipboard value, repeat-copy feedback, keyboard navigation, menu dismissal and focus, touch taps, fallback/failure copying, 200% root text sizing, reduced motion, forced colors, no-JavaScript content, resource loading and automated accessibility. It also calculates contrast from the implemented colors and silhouette compositing.

Actual final worker results (2026-10-06): production build **passed**, TypeScript check **passed**, browser interaction validation **passed**. All five widths (320, 390, 768, 1024, 1440) had no horizontal overflow and zero axe violations in the configured WCAG checks. The open navigation also had zero violations. The actual Chromium clipboard contained `0xa562b9e8c27aeb3f55e1f8bd04bfeabdcdb081e0`. No page exceptions, console errors or failed resources were recorded.

Full review coverage, corrected findings, screenshots, exact worker commands and limitations are in [artifacts/validation.md](artifacts/validation.md). Machine-readable results are in [artifacts/browser-results.json](artifacts/browser-results.json). This is worker validation, not independent certification. Safari, Firefox, physical phones, screen readers and native browser zoom were not tested; root text enlargement and Chromium touch emulation were tested.

The worker installed its toolchain outside this restricted repository at `/tmp/pepes-landing-tools`, leaving repository `node_modules/` untouched. `scripts/validate.mjs` supports optional `PEPES_TOOLCHAIN` (directory with installed packages) and `PEPES_CHROMIUM_EXECUTABLE` (browser executable path) for such environments. Normal installations need neither variable.

## Publish

1. Rebuild after any source change, then run the checks above.
2. Publish the **contents of `dist/`** to the desired static-host directory. Include the entire `assets/` directory, preserving filenames and letter case.
3. Serve over HTTPS for native clipboard support. If clipboard access is denied or unavailable, the site attempts a compatibility copy and otherwise explains how to copy manually.
4. Open the published page and check the logo, fonts, menu and Copy CA action. No server functions, secrets, wallet integration or route rewrites are needed.

The publisher for this assignment serves the supplied export directly and does not rebuild it. Keep `dist/` alongside the source and lockfile in the submission. No Git commands were run in this task because `.git/` was outside the permitted modification scope.

## Files and budget

- `index.html`: visible content and semantic structure.
- `src/style.css`, `src/main.ts`: tokens, responsive styling and interactions.
- `public/assets/`: required local logo/fonts and font notices.
- `dist/`: ready-to-publish production export.
- `scripts/validate.mjs`: repeatable production interaction checks.
- `DESIGN.md`: implemented design system.
- `docs/ATTRIBUTION.md`, `docs/licenses/`: asset and guide attribution.
- `artifacts/`: validation report, machine-readable results, screenshots and payload audit.

Explicit ignore-file path budget: **`.gitignore` ≤512 bytes**. Its scope is generated dependency/cache/build-info folders at every nesting level and disposable `test/scratch/`; it does not ignore `dist/`. There are no vendored packages, registry mirrors, dependency archives or submodules. The 8,388,608-byte submission ceiling and measured payload are recorded in `artifacts/package-audit.json`; the exported runtime remains complete.
