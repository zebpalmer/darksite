# darksite

A design system for **operator software**: admin consoles, dashboards, infrastructure and homelab
tools, queues and review screens — the dense, keyboard-driven, dark-by-default interfaces people
keep open all day. It is built for speed and legibility, not for persuasion.

Everything here is opinionated on purpose. Change the opinions deliberately rather than by
accident.

## Build it once

**The components are the system.** A screen imports them; it never reimplements them.

Write each primitive once, as a Svelte 5 component, and import it everywhere that behavior is
needed. The moment a second screen hand-rolls its own chip-shaped `<div>`, or its own dropdown, or
its own confirmation modal, they begin to drift: one gets the focus ring and the other does not,
one gets the 44px touch height and the other stays 28, one gets fixed and the other is still
broken a year later. That drift is how design systems die, and it is invisible until someone
tries to use the thing on a phone.

So:

- **Need a variation?** Add a prop or a variant to the existing primitive and document it on that
  component's card. `Button` has six variants and four sizes for exactly this reason.
- **Two screens growing the same local helper?** Promote it to a primitive before there is a
  third.
- **Something genuinely new?** Add it here — a card with its props, its states and its don'ts —
  rather than leaving it in one route's folder.
- **Tempted to copy a preview's markup into a page?** Don't. The previews are the reference
  implementation, not a snippet library.

The decision table in [`which-primitive.md`](docs/which-primitive.md) exists so nobody has to make this judgment from
scratch. If something you need is not in it, that is a gap in the system worth filling, not a
reason to improvise.

## Content fundamentals

- **Labels, not sentences, on controls.** A control says `Save`, `Accept all`, `Apply defaults` —
  never "Click here to save your changes". Controls and menus carry labels only, with no
  explanatory sub-text.
- **On work and list pages, explanations live in tooltips**, as a `HelpTip` beside a label or a
  `Field tip` — not as a sentence under a control. **Overview and document pages are prose**: an
  overview's `Intro` says what the product is in a sentence or two, and a document page (help, a
  how-to, a method note) is written out in full (see [`layout.md`](docs/layout.md), "Page types").
- **Dashed means not confirmed**: a suggestion not yet applied, a possible link, an estimated
  position, a low-confidence value. Never decoration, and never a solid fact.
- **One sentence, one action** in an `EmptyState`. The sentence names the way forward; the single
  button takes it.
- **Say the name, never the index.** A severity is `High`, not `4`. Digits appear only on key caps.
- **Plain past tense for results**, in a toast: "Removed Urgent", "Saved as your default",
  "Archived 12 records". A background action's outcome is a toast, not an inline status line.
- **Dates and times:** relative under seven days ("6 min ago", "2 days ago"), an absolute date
  after that ("Oct 2", with the year when it isn't this year), the date in the viewer's locale and
  time zone, and the exact date, time and time zone in a tooltip. `formatRelative` and `formatExact`
  implement it; the relative words come from `strings` (see "Other languages").
- **Calendar dates** — a day with no time, such as a due date or a start date (`'2026-10-01'`) —
  are shown as that day in every time zone, never shifted to the day before west of UTC, and
  follow the same year rule: "Oct 1", or "Oct 1, 2025" when it isn't this year. `formatDate`
  implements it; `formatRelative` counts whole days for one ("today", "2 days ago") and
  `formatExact` gives its full date with no time or zone.
- **Missing values** are an em dash in `ds-text-3`, announced as "No value" — never a blank, which
  reads as still loading. `Missing` draws it; `Table` and `FactList` use it.
- **Numbers and money:** thousands separators and currency in the viewer's locale. Tables show exact
  values; compact values ("12.4K") only where space is tight, with the exact value in a tooltip.
  Money is stored and passed in major units — dollars, not cents. `formatNumber`, `formatCompact`
  and `formatMoney` implement it; `formatMoney(n, 'USD', { maximumFractionDigits: 0 })` gives
  whole units.
- **Stored codes are never shown raw.** A product keeps one label map (`createLabels`) and formats
  every code through it; a code missing from the map reads as words ("Missing start date"), never
  as `missing_start_date`.
- **Sentence case everywhere** — no Title Case headings, no ALL CAPS except the 11px uppercase
  group titles in the navigation. Use American spelling throughout.
- **No emoji, anywhere** — not in copy, not as an icon.

## Visual foundations

**Color.** Components use the `ds-*` roles **only**. The `color-surface-*`, `color-primary-*`,
`color-success-*`, `color-warning-*` and `color-error-*` ramps are the raw palette the roles are
cut from; use them to define a new role, never directly in a component.

- Grounds stack `ds-bg-0` (rail, canvas) → `ds-bg-1` (page) → `ds-bg-2` (panels, bars) →
  `ds-bg-3` (inputs, overlays) → `ds-bg-4` (hover, raised) → `ds-bg-5` (pressed, applied tokens).
- Text hierarchy is `ds-text-heading` / `ds-text-1` / `ds-text-2` / `ds-text-3` — **never
  opacity**. Headings (page titles, Intro, prose headings, dialog and sheet titles) sit a step
  above the body in `ds-text-heading`; the body in dark is a softer 12:1, easier to read at length.
  Opacity does one job: disabled, at 45%.
- `ds-accent` is for marks, borders, small tinted grounds and the one primary button per view. Do
  not flood a surface with it. Use `ds-accent-text` when the accent has to be body-size text.
- Borders carry the structure: `ds-border-subtle` inside a surface, `ds-border` on controls,
  `ds-border-strong` on a secondary button or a dashed edge. Nothing is decorated with a shadow.
- Dark is the default and the fully designed theme; light is a secondary override set. Check both
  before shipping.

**Type.** `sans` is Geist, `mono` is Geist Mono. **12px is the floor and 500 is the ceiling** —
there is no bold in this system, and a utility class asking for one should resolve to 500. The one
weight above it is the headline-number role (28px at 650), used only by `Stat variant="headline"`
for a public page's key figures. The largest size is `ds-text-3xl` (32px); the one text above it is
a `ds-article` title, fluid up to 52px. The one
text below 12px is the 11px uppercase group title in navigation, where capitals and letter-spacing
carry the legibility. Set
titles in `page-title` / `card-title`, body in `body`, labels in `label`, meta and counts in
`meta` or `micro`. Paths, identifiers, hashes, durations, key caps and countdowns go in
`mono-control` / `mono-micro` with `font-variant-numeric: tabular-nums`.

**Space and shape.** A 4px base: `ds-space-1` … `ds-space-16`. Radii climb with the size of the
thing — `ds-radius-xs` on badges and key caps, `ds-radius-sm` on controls, chips and thumbnails,
`ds-radius-md` on cards, panels and popovers, `ds-radius-lg` on dialogs and sheets.

**Elevation.** Three steps and no more: `ds-elev-1` is an edge, `ds-elev-2` lifts a popover or
toast, `ds-elev-3` lifts a dialog or sheet. Edge plus ambient darkness — never a glow, never a
colored shadow.

**Motion.** `ds-dur-fast` for hover and press, `ds-dur-base` for a popover or toast, `ds-dur-slow`
for a sheet, all on `ds-ease-out`. Nothing bounces, nothing slides for decoration, and every
duration is **zeroed** (not merely shortened) under `prefers-reduced-motion`.

**Density.** Desktop is dense: 32px controls, 28px chips, 13px meta. Under `(pointer: coarse)`
every button, chip, tab and list row becomes `ds-h-touch` (44px) **whatever `size` the caller
passed** — the primitives do this themselves, so do not override it. Touch text controls are
forced to 16px, because iOS Safari zooms a smaller one on focus and leaves the page zoomed. See
[`density.md`](docs/density.md).

**Focus.** `:focus-visible { outline: 2px solid var(--ds-focus); outline-offset: 2px }` is global
and unlayered. Never remove it; a primitive may only adjust the offset. Every hotkey is visible as
a `KeyCap` next to the control it drives. See [`focus-and-hotkeys.md`](docs/focus-and-hotkeys.md).

**Imagery.** Content thumbnails are the only pictures. No illustration, no gradients, no hero
images or color bands, nothing decorative in the chrome. An overview page opens with an `Intro` — a
title, a sentence or two and its actions — never an image.

## Accessibility

Every ratio here is computed, and `scripts/check-contrast.mjs` re-checks every documented pair in
every mode as part of `stratt lint`. A color change that breaks a pair fails the build. Every
prebuilt brand, and every brand a product generates, is held to the same pairs (see "Brands").

**Text meets 4.5:1 everywhere this system puts it** in every mode — `ds-text-heading` and `ds-text-1/2/3` on the
grounds they are documented for, every `-text` role on the page and on its own tint, every severity
ink on its ground, and every label on a filled accent or danger ground at rest, hover and press.
`ds-text-3` stops at `ds-bg-3`; use `ds-text-2` from `ds-bg-4` up.

The reading modes soften the text on purpose — paper's primary text is about 10:1 where light's is
15:1 — but stay above these floors.

**Marks meet 3:1:** the focus ring on every ground, the success, warning and danger marks on every
ground in every mode, the categorical palette on the page, on panels and on meter and chart
tracks.

**Two things fall short of 3:1 in every mode but high contrast, by design:**

- **Control edges.** `ds-border`, `ds-border-subtle` and `ds-border-strong` are 1.1–1.9:1 against
  their grounds; WCAG 2.1 SC 1.4.11 asks 3:1 of a component's identifying boundary. These controls
  are identified by their label, fill and position as much as their edge — but a strict audit will
  flag them. (`ds-accent-mixed` is 2.4:1 in dark for the same reason.)
- **The Critical mark** is 2.6–2.9:1 on the dark and night grounds. The badge and picker always
  carry the word.

**For strict conformance, use the high-contrast mode**: `data-ds-theme="contrast"`. It is dark with
every text role at 7:1 or more and every border and mark at 3:1 or more — no shortfalls. It also
applies automatically when the viewer's system asks for more contrast (`prefers-contrast: more`)
and the app has not chosen another mode (see "Modes" below).

What the components must guarantee: every interactive element is reachable by keyboard and shows
the focus ring; a severity always carries its word and an error always carries an icon and a
message, so neither depends on color; every motion stops under `prefers-reduced-motion`; and touch
targets are 44px, with the few exceptions `density.md` lists — all of them above WCAG 2.2's 24px
minimum.

## Layout and navigation

Two pages carry the structure, and both are worth reading before building a screen:

- **[`layout.md`](docs/layout.md)** — the three page archetypes (content page, work view, focused page), scroll
  ownership and the pane contract, when a sidebar is justified, width, the four breakpoints, and
  the rule that components use container queries while only the shell uses viewport widths.
- **[`shell.md`](docs/shell.md)** — the frame: one navigation list feeding every surface, the rail, the phone tab
  bar, secondary navigation, the top bar, and the stacking order.

The frame is built from `AppShell`, `NavRail`, `TabBar`, `SideNav` and `TopBar`.

## Iconography

Lucide, imported one icon at a time. **16px** inside a control, **18px** in a `SheetItem` or a
touch button, **20px** in the tab bar and the collapsed rail, **18px** in the expanded rail, **24px** in an `EmptyState`. Icons inherit
`currentColor`, so they take the role color of the text beside them; set `svg { flex-shrink: 0 }`
globally so an icon never collapses in a flex row. Never use an emoji where an icon belongs.

Swapping icon sets is fine. Shipping two icon sets is not.

## No mark

This system ships **no logo**, deliberately: it is a starting point, and the mark is the first
thing an app brings of its own. Where a product would put one — the top of the rail, a sign-in
screen — set the product's name in plain `sans` at weight 500 until there is a real mark. Add it
as an asset group when there is.

## Severity

The one ordered scale — Info, Low, Medium, High, Critical — drawn identically everywhere it
appears. Read [`severity.md`](docs/severity.md) before rendering one, and never use a severity color for anything
that is not a severity.

Severity is the built-in instance of a general ordinal scale. An app that needs its own ordered
scale — a priority, a confidence, a clearance level — defines one with `defineScale` and its own
colors, and draws it with `ScaleBadge` and `ScalePicker` (see "Custom scales" in `severity.md`).

## Using darksite

darksite is a **Svelte 5** package (it needs Svelte 5.29 or later). Each release attaches a packed,
built tarball to its GitHub release; install a pinned version from there, replacing `X.Y.Z`:

```sh
npm install https://github.com/zebpalmer/darksite/releases/download/vX.Y.Z/darksite-X.Y.Z.tgz
```

The tarball needs no git on the installing machine and no build step. It carries this README,
`CHANGELOG.md`, `docs/` and the component cards (`components/*/README.md`), so the rules and what
changed in each release can be read in `node_modules/darksite`. As a fallback, install the
tag straight from the repository; npm then clones it and builds `dist/` itself through `prepare`,
which needs git and the dev dependencies:

```sh
npm install github:zebpalmer/darksite#vX.Y.Z
```

Load the two stylesheets once, in the root layout, then import components:

```svelte
<script>
	import 'darksite/tokens.css';
	import 'darksite/base.css';
	import { Button } from 'darksite';
</script>

<Button variant="primary" keycap="enter">Save</Button>
```

`tokens.css` declares every token as a CSS custom property. `base.css` holds the global rules the
components rely on: box sizing, the focus ring, reduced motion, the 16px touch font size, the
`.ds-control` look, the shared keyframes, and three classes for pages of text: `ds-prose` (help and
how-tos), `ds-reading` (long-form reading in the reading font) and `ds-article` (a post on a public
site, with `ds-article-wide` for what breaks out of its text column, and `ds-article-ghost` for a
post from the Ghost CMS, with the `ghostCards` attachment for its cards' behavior). To re-theme a product, override `--ds-*` properties in
its own stylesheet, after these two imports — no component changes.

A site upgrades by changing the version it pins. For a genuine one-off divergence, copy that one
component into the site's own `lib` and own it there; never fork the package.

Each card specifies its component's props, states and don'ts, and the gallery shows every component
in use.

**The media set is optional.** `Card`, `Carousel`, `JustifiedGrid` and `Lightbox` are for products
whose content is images and video. An admin console or a dashboard can ignore them: the package
tree-shakes, so a component a product never imports costs it nothing.

### Modes

A **mode** is the viewer's choice of how the page looks; every product gets all five:

| Mode | What it is |
|---|---|
| `dark` | The default. |
| `light` | The light page. |
| `paper` | A reading mode: a warm, slightly brown page with softer text, like a reader's sepia setting. |
| `night` | A reading mode: a warm, dark page with softer text, for reading in the dark. |
| `contrast` | High contrast: dark, with every text role at 7:1 or more and every edge and mark at 3:1. |

A mode is set with an attribute, on `<html>` or on any part of the page — so a reader column can be
paper while the rest of the app stays dark:

```html
<html data-ds-theme="light">
<article data-ds-theme="paper">…</article>
```

`data-theme` works too; `data-ds-theme` wins when both are set, so use it when `data-theme` already
belongs to another library. With no attribute on `<html>`, darksite follows the viewer's system:
`prefers-contrast: more` selects high contrast, then `prefers-color-scheme: light` selects light,
and dark is the default. An explicit `dark` still becomes high contrast when the viewer asks for
more contrast; the other modes are never changed. The reading modes are only ever chosen. Each mode
sets `color-scheme`, so native scrollbars and form controls match it.

**Let the viewer choose** with `ModePicker` (System, Dark, Light, Paper, Night, High contrast). It
drives the `mode` store, which sets the attribute on `<html>` and remembers the choice in the
browser; `mode.subscribe(fn)` also hands each choice to the app, to keep it with the viewer's
account. Call `mode.init()` once in the root layout, and put `MODE_SCRIPT` in a `<script>` in
`app.html`'s `<head>` so the saved mode applies before the first paint. For long-form text, the
`ds-reading` class sets the reading font (`--font-reading`) at a comfortable size and measure.

### Brands

A **brand** is a product's colors and fonts. darksite owns the structure and behavior — the shell,
navigation, tables, forms, keys — and a brand gives a product a look of its own, in every mode.
The meaning of success, warning and danger stays the same across products, and every contrast pair
above holds for every brand.

**Use a prebuilt brand** by importing it after `tokens.css` and naming it on `<html>`:

```js
import 'darksite/tokens.css';
import 'darksite/base.css';
import 'darksite/brands/teal.css';
```

```html
<html data-brand="teal">
```

The prebuilt brands are `violet` (the default), `blue`, `teal`, `green`, `amber`, `rose`,
`graphite` and `harbor` (a colored navigation rail), and brands from well-known open-source editor
color schemes: `nord`, `dracula`, `solarized`, `gruvbox`, `catppuccin`, `tokyo-night`, `rose-pine`
and `one-dark` (credited in `NOTICE.md`). The gallery's "Brands and modes" page shows them all.

**Make your own** from a short brand file, with the `darksite-theme` command the package installs:

```json
{
  "name": "acme",
  "accent": "#e85d3a",
  "neutral": { "hue": 40, "chroma": 0.5 },
  "chrome": { "rail": "#24130d" },
  "fonts": { "sans": "Inter, system-ui, sans-serif" }
}
```

```bash
npx darksite-theme brand.json --out src/brand.css
```

Import the output after `tokens.css`; it applies to the whole app, with no attribute needed.
`npx darksite-theme --preset nord > brand.json` starts from a prebuilt brand. A brand can set the
accent, a second accent, the grays' tint, the page and text colors, the navigation chrome's own
color, the success, warning and danger hues, and the fonts. The generator builds every role each
input drives in every mode, then checks every documented contrast pair and nudges any color that
falls short, reporting what it moved; a brand that cannot pass fails. [`docs/brands.md`](docs/brands.md)
has the full brand file reference. Regenerate after upgrading darksite.

### Other languages

Every word darksite shows or speaks on its own — "Close", "Clear all", "No matches", "Select row",
"3 files", "2 days ago" — comes from one table, `strings`, in English by default. A product in
another language overrides it once, before its app mounts (the root layout's script is the place):

```js
import { setStrings } from 'darksite';

setStrings({
	close: 'Fermer',
	clearAll: 'Tout effacer',
	days: (n) => `${n} ${n === 1 ? 'jour' : 'jours'}`,
	ago: (age) => `il y a ${age}`
});
```

Words that depend on a number are functions. A prop that names the same thing — a `label`, an
`emptyText` — still wins for that one instance. Dates and numbers already follow the viewer's
locale through `Intl`. `ErrorPage` takes its titles and messages from its own `errorCopy` prop.

### Using darksite with Tailwind or another CSS framework

The rules in `base.css` live in the cascade layer `ds.base`. Any **unlayered** CSS the app writes
beats them, whatever its specificity. An app that uses layers — Tailwind 4 declares `theme`, `base`,
`components` and `utilities` — puts darksite where it belongs with one order statement, at the top of
the stylesheet that loads first:

```css
/* app.css */
@layer theme, base, ds.base, components, utilities;
@import 'tailwindcss';
```

Layer order is fixed by first appearance, so this statement must come before Tailwind's import and
before `darksite/base.css` is loaded. `ds.base` sits after Tailwind's `base` (Preflight), so
darksite's base rules win over the reset, and before `components` and `utilities`, so a utility
still overrides a darksite base rule. The app's own base styles win over darksite by living in a
layer listed after `ds.base`, or by staying unlayered:

```css
@layer theme, base, ds.base, app-base, components, utilities;

@layer app-base {
	body {
		font-feature-settings: 'ss01';
	}
}
```

Three things in `base.css` are unlayered on purpose: the focus ring, the reduced-motion duration
overrides, and the keyframes. The component styles themselves are scoped by Svelte and unlayered,
so a utility class does not restyle a darksite component; use its props and variants instead. The
exception is the margin reset on a component whose root is a `<figure>` (`CodeBlock`, `BarSeries`,
`Ring`): it sits in `ds.base` at zero specificity, so it only clears the browser's figure margin and
the page sets the space around the block (a `ds-article`'s rhythm, a margin utility).

Then align Tailwind to these tokens rather than beside them: expose each `ds-*` color role as a
utility color, map the type scale to `ds-text-*` / `ds-lh-*`, cap every weight utility at 500, and
let the radius utilities land on 4 / 6 / 8 / 12. A utility and a token that disagree is the bug this
alignment prevents. In Tailwind 4 that is a `@theme inline` block, which points each utility at
the live custom property so it follows the active theme:

```css
@theme inline {
	/* Colors: the roles only, never Tailwind's palette or darksite's raw ramps. */
	--color-*: initial;
	--color-bg-0: var(--ds-bg-0);
	--color-bg-1: var(--ds-bg-1);
	--color-bg-2: var(--ds-bg-2);
	--color-bg-3: var(--ds-bg-3);
	--color-bg-4: var(--ds-bg-4);
	--color-bg-5: var(--ds-bg-5);
	--color-text-heading: var(--ds-text-heading);
	--color-text-1: var(--ds-text-1);
	--color-text-2: var(--ds-text-2);
	--color-text-3: var(--ds-text-3);
	--color-border: var(--ds-border);
	--color-border-subtle: var(--ds-border-subtle);
	--color-border-strong: var(--ds-border-strong);
	--color-accent: var(--ds-accent);
	--color-accent-text: var(--ds-accent-text);
	--color-success: var(--ds-success);
	--color-warning: var(--ds-warning);
	--color-danger: var(--ds-danger);
	--color-danger-text: var(--ds-danger-text);

	/* Type: the darksite scale, each size with its line height. */
	--text-*: initial;
	--text-xs: var(--ds-text-xs);
	--text-xs--line-height: var(--ds-lh-xs);
	--text-sm: var(--ds-text-sm);
	--text-sm--line-height: var(--ds-lh-sm);
	--text-md: var(--ds-text-md);
	--text-md--line-height: var(--ds-lh-md);
	--text-lg: var(--ds-text-lg);
	--text-lg--line-height: var(--ds-lh-lg);
	--text-xl: var(--ds-text-xl);
	--text-xl--line-height: var(--ds-lh-xl);
	--text-2xl: var(--ds-text-2xl);
	--text-2xl--line-height: var(--ds-lh-2xl);
	--text-3xl: var(--ds-text-3xl);
	--text-3xl--line-height: var(--ds-lh-3xl);

	/* Weight: 500 is the ceiling, so every heavier utility resolves to it. */
	--font-weight-*: initial;
	--font-weight-normal: 400;
	--font-weight-medium: 500;
	--font-weight-semibold: 500;
	--font-weight-bold: 500;

	/* Radius: 4 / 6 / 8 / 12, and a pill. */
	--radius-*: initial;
	--radius-xs: var(--ds-radius-xs);
	--radius-sm: var(--ds-radius-sm);
	--radius-md: var(--ds-radius-md);
	--radius-lg: var(--ds-radius-lg);
	--radius-full: var(--ds-radius-full);
}
```

Add the other roles (tints, severities, the categorical palette) the same way as the app needs
them. Leave `--font-sans` and `--font-mono` alone: darksite already declares both under the names
Tailwind reads, unlayered, so they win over Tailwind's defaults. Another framework follows the same
two steps: put `ds.base` after its reset in the layer order, and point its theme at the `--ds-*`
properties instead of copying their values.

To add a primitive, follow `AGENTS.md`, "Delivering a primitive".

## In this repository

| Path | What |
|---|---|
| `tokens.json` | The tokens — the single source of truth. |
| `src/lib/` | The package: components, `tokens.css` (generated by `npm run tokens`) and `base.css`. |
| `src/routes/` | A live gallery of the implemented components: `npm run dev`. |
| `components/<Name>/` | Each component's card: `README.md` (props, states, don'ts). |
| `docs/` | The rules: which primitive, layout, shell and navigation, density, focus and hotkeys, severity, don'ts. |
| `CHANGELOG.md` | What changed in each release. |

Development runs through stratt: `stratt all` verifies (tokens, contrast, formatting, types, the
package and publint, tests), `stratt build` also builds the gallery (CI runs both), and
`stratt release minor` versions and tags.

## What's not included

- **Font files.** Geist and Geist Mono are named in `type.families` but not vendored; without them
  the stacks fall back to system fonts. Self-host them in a real app, and check their license terms
  before redistributing the files.
- **Icons.** darksite depends on `@lucide/svelte`; check its license terms before redistributing.
- **Charts, a date picker, a rich-text editor.** Products that need them choose a library and
  theme it with the tokens.
