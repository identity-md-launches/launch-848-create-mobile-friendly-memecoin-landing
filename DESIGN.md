# Pepes design system

## Overview

This is a single-page community memecoin landing page. The composition puts the actual Pepes profile photo and wordmark in the header, `$PEPES` at the center, then the supplied description and complete contract address. A solid Pepe-green field, rounded white lettering and a quiet frog illustration carry the identity. Copying the address is the primary action; the community link is secondary.

The source of truth is `src/style.css`, the semantic markup in `index.html`, and interaction states in `src/main.ts`. The page uses Vite and strict TypeScript with progressively enhanced HTML. It is intentionally small enough to work without a component framework.

## Colors

All colors are sRGB hex values. The semantic tokens refer to a small green palette in `src/style.css:17`.

| Token | Value / reference | Use |
| --- | --- | --- |
| `--color-bg` | `--green-600`, `#377743` | Solid page background |
| `--color-surface` | `--green-700`, `#285e33` | Contract card and navigation popover |
| `--color-surface-hover` | `--green-500`, `#43814e` | Menu links, menu button and community-link hover |
| `--color-text` | `--white`, `#ffffff` | Headline, description, address and navigation |
| `--color-text-secondary` | `--green-100`, `#eff7e9` | Eyebrow, captions and footer |
| `--color-action` | `--white`, `#ffffff` | Primary copy-button fill |
| `--color-action-text` | `--green-700`, `#285e33` | Copy-button text and icon |
| `--color-action-hover` | `--green-100`, `#eff7e9` | Copy-button hover |
| `--color-focus` | `--white`, `#ffffff` | 3px keyboard outline, offset 5px; copy button uses 3px offset |
| `--color-border` | `#ffffff38` | Quiet structural borders |

Success uses a check icon and the literal text “Copied!” rather than a new color. Failure uses persistent explanatory text. Text selection uses the action fill and action text tokens. Forced-colors mode uses the system `Highlight` focus color and `ButtonText` button border. There is one color scheme; no dark-mode switch.

Measured contrast: white on the page is 5.41:1; secondary text on the page is 4.93:1; secondary text on the lightest frog composite is 4.57:1; white on the contract/menu surface is 7.67:1. See `artifacts/browser-results.json` for all measured pairs and the validation report for scope.

## Typography

Two local WOFF2 fonts are bundled under `public/assets/`; neither requires a runtime font service. The display family is Lilita One, normal weight 400, with `Arial Rounded MT Bold`, `Trebuchet MS`, and sans-serif fallbacks. Nunito supplies normal variable weights 400–800, with `Trebuchet MS` and sans-serif fallbacks. The contract uses `SFMono-Regular`, Consolas, `Liberation Mono`, monospace. Font synthesis is disabled; the source requests only supplied upright weights. The local fonts were observed loaded in Chromium.

| Role | Implemented styling |
| --- | --- |
| Hero title | Lilita One 400; `clamp(5rem, 17vw, 12rem)`; line-height 1; tracking −0.035em; rotation −3° |
| Mobile title, ≤35rem | `clamp(2rem, calc(17vw + 0.5rem), 7rem)`; fits narrow and enlarged-text layouts |
| Wordmark | Lilita One 400; 2.5rem, mobile `clamp(1.5rem, 8.5vw, 2.125rem)`; line-height 1.1; tracking −0.04em |
| Description | Nunito 500; `--text-body: 1.1875rem`, mobile 1.0625rem; line-height 1.65; maximum 33rem, mobile 22rem; `text-wrap: pretty` |
| Description emphasis | Nunito 800; same size as description |
| Labels / address | `--text-label: 0.875rem`; address monospace 0.875rem, line-height 1.65 or 1.8 on mobile |
| Captions | `--text-small: 0.8125rem`, line-height 1.5 |
| Eyebrow | Nunito 600; 0.875rem with 0.02em tracking; mobile 0.75rem without added tracking |
| Actions | Copy: Nunito 800 at 0.875rem; community: Nunito 700 at 1rem |

The address wraps with `overflow-wrap: anywhere` and stays selectable in full. No address truncation, inserted characters, ellipsis, or CSS line clamp is used. Decorative title spans are hidden from assistive technology; the single h1 exposes `$PEPES` as its accessible name.

## Layout

`.page` is a vertical flex layout with a minimum height of `100svh` and a maximum width of 1800px. `main` grows into remaining space and centers `.hero`. Height is content-driven: small screens can scroll naturally. The normal-flow footer never covers the copy action.

`--page-gutter` is `clamp(1.25rem, 4.5vw, 4.5rem)`. Header padding accounts for top and side safe areas; the footer accounts for the bottom safe area. Shared spacing tokens are `--space-1` (0.5rem), `--space-2` (0.75rem), `--space-3` (1rem), `--space-5` (2rem), and `--space-6` (3rem). Optical exceptions include the 1.75rem title separation and 2.5rem description-to-contract gap.

The contract group is at most 46.5rem wide. Above 48rem the address and button form one row. At 48rem and below, the card stacks, the button fills its inner width, and the group is capped at 36rem. At 35rem and below, the card has 1rem padding, the address aligns to the leading edge, the hero uses 4.5rem top and 3rem bottom padding, and the footer wraps and centers. The side doodle disappears below 62rem. The community link uses a three-column inline grid with a shrinkable text column so enlarged text wraps without overflowing.

Observed in Chromium at widths 320, 390, 768, 1024 and 1440 CSS pixels: no horizontal overflow, full address visibility, readable hierarchy, and copy/menu targets at least 44px. At 320px with the root font enlarged to 200%, the page becomes taller and the address and community label wrap. Native browser zoom, other browser engines and physical devices remain unverified.

## Elevation & Depth

The field is flat and solid. An inline SVG frog in `index.html` uses white at 0.035 opacity; its facial cutouts use the page color. It sits in a clipped, non-interactive background layer with `pointer-events: none` and `aria-hidden`. It does not add horizontal scrolling. The silhouette is 1050px/115vw on larger screens and 820px on mobile.

The title has a subtle `0 5px 0 #285e3340` shadow. The menu alone uses an elevated `0 12px 40px #16372030` shadow. Header z-index 5 places the menu above the hero; the skip link uses z-index 20. Structural borders are 1px. The logo has a 1px white outline at 10% opacity.

## Shapes

`--radius-card` is 1.125rem; `--radius-button` is 0.625rem; `--radius-pill` is 999px. The desktop card/button nesting pairs 18px outer radius, 8px inset and 10px inner radius. The logo and menu control are circular. The mobile card uses larger padding to accommodate the two-row address. SVG controls use `currentColor` with consistent rounded strokes.

## Components

These are HTML/CSS patterns rather than exported framework components.

| Pattern | Source and behavior |
| --- | --- |
| Brand | `.brand` in `index.html`: the downloaded profile photograph and adjacent wordmark share one home link. The logo has empty alt text because the link has an accessible name. |
| Navigation disclosure | `.menu-toggle`, `.menu`, and `closeMenu()` in `src/main.ts`. A native button exposes expanded state and its controlled nav. Enter/Space toggles; Tab reaches links; Escape closes and restores focus. Outside clicks, departure of focus and link selection close it. It is nonmodal, so it does not trap focus. |
| Contract card | `.contract-group`, `.contract-card`, `.contract-value`. The complete address has one source in HTML; the copy handler reads that exact text. The hash-navigation target is programmatically focusable. |
| Copy action | `.copy-button`. White primary button with default, hover, pressed, busy, success, failure and focus states. Uses `navigator.clipboard.writeText`, then a legacy fallback when unavailable or rejected. Success replaces the icon and populates the existing polite status region for 3 seconds. Failure remains until another attempt and explains manual copying. Temporary fallback fields are removed and focus returns to the button. |
| Community link | `.community-link`. Outlined pill with X icon, destination text and arrow. Opens the supplied account in a new tab; the accessible name announces this. |
| Skip link | `.skip-link`. First keyboard stop; normally clipped and offscreen, fully revealed on focus; targets the main landmark. |

All essential content and direct external links render without JavaScript. Nonfunctional controls stay hidden in that state, and a manual-copy instruction appears. Interactions have no entry animation. Under `prefers-reduced-motion: no-preference`, hover/press transitions last 150ms and pressing an action scales it to 0.96. Reduced-motion mode has no transitions or scale feedback; textual and icon feedback remains.

## Do’s and don’ts

- Reuse semantic color tokens and existing action, focus and spacing patterns. Keep copy as the one filled primary action.
- Keep the address complete and selectable. Read the copy value from the rendered address to avoid divergent constants.
- Preserve the local profile photo, local fonts and relative export URLs. Update asset provenance when changing the logo.
- Let text containers grow. Do not replace the responsive address with an ellipsis or a horizontally scrolling one-line field.
- For another content section, use semantic headings after the h1, inherit the body family and page gutters, and reuse the community or copy-button pattern according to action importance. Use a hash target or explicitly exported static page; do not assume server route rewrites.

Design-review and documentation references are credited in `docs/ATTRIBUTION.md`.
