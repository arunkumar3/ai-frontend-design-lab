# Design Map

## Spacing Scale
- Base unit: 10px (729 occurrences — dominant by far in the sampled DOM)
- Scale observed: 5px, 8px, 10px, 16px, 25px, 30px, 64px
- No conventional 8px-grid signal; the page is built on round-10 increments instead

## Font Hierarchy
- Single family across the entire page: **Lato** (1,913 of 1,913 sampled font-family occurrences)
- h1 — 20px / weight 600 / line-height 28.6px
- tab-label — 14px / weight 700 / uppercase (MOVIES, TV SHOWS)
- body — 16px / weight 400 / line-height 24px
- label — 14px / weight 400
- caption — 12px / weight 400 (most frequent single size in the sample — group counts, filter chip text)

## Color Palette
- `#060D17` — page background (75.8% of visible area)
- `#0A151F` — elevated row surface (23.4% of visible area, no shadow — separated by luminance only)
- `#B9BDCC` — primary text
- `#FFFFFF` — high-emphasis text (cookie banner copy)
- `#999C9F` — secondary text
- `#4C5A67` — tertiary/disabled text
- `#78A6B8` — accent/link color, the most frequently applied non-neutral color on the page (392 occurrences)
- `#FBC500` — brand yellow, confined to the logo wordmark and one CTA button

## Image Ratios
- Poster art: **2:3** (standard theatrical one-sheet ratio)
- Provider logo icon: **1:1**, rendered 50×50px from a 100×100 source, border-radius 20%

## Component Tokens
- Radius: `20%` (provider icon "squircle"), `5px`, `4px`, `2px` (buttons/chips)
- Shadow: none detected — every surface is flat; depth comes from the `#060D17` → `#0A151F` background step
- Grid: container max-width 1752px; poster rows are **horizontal-scroll flex containers per provider group**, not a single wrapping CSS grid (`domData.grid` returned null)
- Transitions: `transform 0.3s ease-out`, `opacity 0.2s ease-in-out` — used on carousel arrows/hover states only

---

# Taste DNA

### Platform Identity Without Poster Contamination
- **Trigger**: Showing which of a dozen-plus streaming services — each with its own saturated brand color and logo — a title belongs to, across hundreds of new titles added per day.
- **Decision**: Stamp platform identity once per group header (a single 50×50 icon plus a title count) instead of overlaying a platform badge on every individual poster.
- **Reason**: A badge on every poster would multiply a dozen competing brand colors across the same viewport simultaneously — legibility collapses when Netflix red, Disney blue, and Hulu green all fight for attention on thirty posters at once. Grouping the badge at the row level lets the poster stay pure artwork.
- **Evidence**: Provider icons are fixed 50×50px with `border-radius: 20%` (366 occurrences in the DOM sample) and appear only as icon-only elements; zero comparable badge overlays were found on poster/card elements; the full-page capture shows one platform icon plus "N titles" preceding each horizontally-scrolling row, never repeated per card.

### Two-Tier Darkness Instead of Shadow Depth
- **Trigger**: Separating the poster-grid surface from page chrome (nav, filters) without a lifted "card" background that would compete with the posters' own contrast.
- **Decision**: A two-step near-black luminance system (`#060D17` page / `#0A151F` row surface) instead of drop-shadow cards.
- **Reason**: A shadow implies a light source and a raised plane, which reads as app chrome. A flat luminance step reads as a dim screening room — the only color in the frame is the poster art and the provider logos, not the interface itself.
- **Evidence**: `domData.effects.shadows` returned empty for this page. Background-color area share: `#060D17` at 75.8%, `#0A151F` at 23.4% — the entire surface is built from two flat neutrals with zero elevation via shadow.

### Base-10 Spacing Over the Web-Standard Base-8
- **Trigger**: Building a dense, filter-heavy interface (seven filter dropdowns, per-group counts, per-row carousels) that still needed to read as hand-tuned rather than mechanically generated.
- **Decision**: Standardized on a 10px spacing unit rather than the more conventional 8px web grid.
- **Reason**: 10px divides into round, immediately legible steps (5, 10, 20, 25, 30) that suit chip padding and icon gaps in a data-dense filter bar better than the 8/16/24/32 ladder would.
- **Evidence**: `spacingDistribution` is dominated by 10px (729 occurrences), with 5px (27) and 25px (8) as secondary steps; no comparable frequency appears at the classic 8/16/24/32px marks.

### Restraint: One Accent Color, Rationed to a Single Surface
- **Trigger**: Owning a bright, recognizable brand yellow (`#FBC500`) that could have been used throughout the interface to compensate for an otherwise monochrome navy palette.
- **Decision**: Keep yellow off every persistent UI element — nav, tabs, and filters all render in gray or teal — reserving it for the logo wordmark and exactly one CTA (the cookie-consent "I agree" button).
- **Reason**: A page whose entire job is hosting a dozen strangers' brand colors can't also compete with its own brand color for attention. Withholding yellow keeps the provider logos as the only genuinely "colorful" elements a user has to parse.
- **Evidence**: `accentCandidates`' top value by frequency is `#78A6B8` (392 occurrences), not the brand yellow; `#FBC500` appears only as a single low-count background color tied to the consent button in the captured sample.

---

## Capture caveats
- New-tab viewport measured 1200×720 rather than the intended 1440×900 (Playwright MCP tab-creation default); container max-width and column counts should be read as approximate at desktop widths above 1200px.
- The in-page region/country switcher was not located in this capture — the hamburger menu (top-right) exposes only utility links (Connect your TV, Apps, About us, API, Terms, Privacy). Region appears to be resolved via the URL locale segment (`/us/`) rather than a visible in-page control.
- "What happens to titles lacking artwork" was not observed — every poster in the captured feed had real art. Not confirmed either way.
