# Changelog

All notable changes to darksite are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `WorkView`: the work-view frame — `header` (a PageHeader), `rail` (a FilterRail) beside the
  results, `top` (ActiveFilters), the results as the one scroller (a Table placed in it becomes
  the scroller, so its header sticks) and `footer` (an ActionBar). Below 768px the document
  scrolls, the rail is the FilterRail's Filters button and the footer sticks above the tab bar.
- `AppShell` hands the content column to a mounted `WorkView`: zero padding at every width, and
  from 768px the shell locks to the viewport so the WorkView fills what the Banner and TopBar
  leave — no height arithmetic or negative margins in pages.
- `FilterRail` section types: `type: 'text'` (one free-text value, applied on Enter or blur) and
  `type: 'search'` (a Combobox over the options, with chosen values as removable chips, and
  `onsearch` / `loading` for server search). Sections also take `placeholder`, `labelFor` and
  `strict`.
- `filterLabel(section, value)` and `unlistedValues(section, value)`.

### Changed

- `filtersFromParams` keeps URL values a section's options do not list instead of dropping them
  (a linked view keeps its filters while options are partial or loading); `strict: true` on a
  section restores dropping. It also trims values, drops empty ones, and keeps one value for a
  `text` section. `FilterRail` shows such values as checked rows and `ActiveFilters` as chips,
  labelled by `labelFor(value)` or the value itself; free text is quoted in its chip.
- `FilterSection.options` is optional (a `text` section has none); code that reads
  `section.options` directly needs `?? []`.

## [0.7.0] — 2026-10-14

### Added

- `data-ds-theme` selects a theme like `data-theme`, and wins when both are set, for apps whose
  `data-theme` belongs to another library. With no theme chosen, `prefers-color-scheme: light`
  selects the light theme; dark stays the default. Every theme sets `color-scheme` (high contrast
  is dark).
- z-index tokens for the stacking order: `--ds-z-raised` (1), `--ds-z-sticky` (20),
  `--ds-z-topbar` (21), `--ds-z-tooltip` (50), `--ds-z-popover` (60), `--ds-z-toast` (70),
  `--ds-z-skip` (90).
- Each `v*` release attaches the packed, built tarball (`darksite-X.Y.Z.tgz`) to its GitHub
  release, so products can install without git or a build step.
- README: "Using darksite with Tailwind or another CSS framework", with the `@layer` order
  statement and a Tailwind 4 `@theme inline` mapping to the `ds-*` roles.
- `topmost` attachment: keeps an element visible and usable above an open modal by moving it into
  the topmost open modal `<dialog>` and back when it closes. `Toaster` uses it by default
  (`topmost={false}` opts out), so toasts are no longer inert behind a `Dialog`, `Sheet` or
  `Lightbox`.
- `modals`, a reactive read-only view of the open modals (`open`, `count`, `top`, `dirty`), and
  `trackModal(dialog, { dirty })` for a custom modal dialog.
- `dirty` and `onbeforeclose` on `Dialog` and `Sheet`; `onbeforeclose` returns `false` to keep the
  modal open on Esc, the scrim or Close/Cancel.
- `<Toaster hotkeys={false}>` turns off the toast key bindings and keeps the key caps;
  `duration: null` makes a toast sticky until it is dismissed or its action runs.
- `media.phone` and `media.coarse` (plus `MediaFlag`, `PHONE_QUERY`, `COARSE_QUERY`): reactive,
  SSR-safe media checks.
- `defineScale` and the `Scale` type: an ordinal scale of up to nine stops (each a name plus mark,
  ground and ink colors), an optional unranked "unknown" stop and `null` as unset, with `label`,
  `rank`, `vars`, `key`/`fromKey`, `options(max)`, `highest` and `compare`.
- `ScaleBadge` and `ScalePicker` for app-defined scales; the picker folds by its own width into
  one row, two balanced rows, or three rows for seven or more cells. `checkScaleContrast` and
  `contrastRatio` let apps check their own scale colors in each theme. `severityScale` is the
  built-in instance.
- Hotkey binding tables (`hotkeys.ts`): declarative `{ keys, action, label, group, when }`
  bindings, `buildHotkeyMap` with conflict detection, `resolveHotkey`, `groupBindings`,
  `installHotkeys` and a `hotkeys` attachment; `normalizeKey` in `keycap.ts`.
- `KeyLegend`: a view's hotkeys grouped with key caps, drawn from the same binding table.
- `ListRow`: a dense one- or two-line row with leading, title, meta and trailing, as a link, a
  button or static (40 / 32 dense / 44 touch).
- `Rating`: a star rating as a radio group, with a read-only display and 44px stars on touch.
- `Stepper`: − value + in the control look, a spinbutton with arrow and page steps.
- `ErrorPage` and `errorCopy`: the focused page for a failed route, with neutral copy by status.
- `Carousel`: a titled horizontal row of tiles on a scroll-snap track, one tab stop with
  ← / → / Home / End, mouse-only previous and next buttons, tile width from Grid density, optional
  "See all", count, loading skeleton and empty state.
- `Lightbox`: a full-screen image viewer on the native modal `<dialog>` with bindable `open` and
  `index`, keyboard and swipe navigation, an announced counter, zoom and pan, neighbor preloading,
  `caption` and `actions` snippets, and safe-area insets.
- `NavRail`: `search`, `status` and `badge` slots, and `pinned` to hide the toggle
  (`expanded={false} pinned` keeps the rail collapsed); `AppShell` passes them as `railSearch`,
  `railStatus`, `railBadge` and `railPinned`.
- `Banner`: `remember={false}` dismisses for this page view only; the update-available notice
  pattern is documented in `docs/shell.md`.
- `SkeletonLoader`: a `grid` variant that honors `density`, `min` and `--ds-grid-min`.
- `formatCountdown`, `formatConfidence` and `initials` (now shared by `Avatar`, `SourceBadge` and
  `Toaster`).

### Changed

- `base.css` rules live in `@layer ds.base`, so an app's unlayered styles win over them. The focus
  ring, the reduced-motion duration overrides and the keyframes stay unlayered.
- Theme selection order: explicit attribute, then `prefers-contrast: more`, then
  `prefers-color-scheme: light`, then dark. An explicit dark choice still becomes high contrast
  under `prefers-contrast: more`.
- Every component z-index uses the new tokens. `HelpTip` rises from 30 to `--ds-z-tooltip` (50).
- The svelte peer dependency is now `^5.29.0` (attachments).
- README and AGENTS.md recommend installing the release tarball, with the git tag as fallback.
- `Dialog` and `Sheet` draw their surface and animation on the inner panel instead of the
  `<dialog>` element, so fixed elements moved into them keep viewport positioning.
- `SeverityBadge` and `SeverityPicker` are thin wrappers over `severityScale` with an unchanged API;
  under a `max` ceiling the picker folds by the number of stops shown. Their root classes are now
  `ds-scale` and `ds-scalepicker`.
- `matchesKey`: a bare letter no longer matches with shift held, so `g` and `shift+g` are distinct
  keys.
- `scripts/check-contrast.mjs` reads the severity stops from `src/lib/severity.ts`, so a new stop
  cannot go unchecked.

### Fixed

- `prefers-contrast: more` now applies when a non-darksite `data-theme` value is present.
- A nested light or high-contrast subtree no longer inherits roles it leaves out from the
  surrounding theme.
- `Dialog`'s `onconfirm` type accepts handlers that return a value.
- A non-cancelable Esc closes a `Dialog` or `Sheet` and its `open` state follows.
- `docs/shell.md`: the stacking table matches the shipped layers, and the `NavItem` example matches
  the real type.
- The install docs no longer pin `v0.1.0`.

## [0.6.0] — 2026-10-14

### Added

- Every remaining card is now a component: `Field`, `Input`, `Combobox`, `SegmentedControl`,
  `Tabs`, `SeverityPicker`, `Dialog`, `Popover`, `Card`, `EntityCard`, `Avatar`, `Grid` and
  `JustifiedGrid`.
- `justifyRows`, the justified-rows layout behind `JustifiedGrid`, as a pure function.
- `formatDuration` for lengths of time as a clock (`1:02:05`).
- `--ds-grid-min`: set it on the root to apply the viewer's grid density everywhere.

### Removed

- The last static `preview.html` files and `components/index.html`. The cards and the gallery
  describe every component.

## [0.5.0] — 2026-10-14

### Added

- The shell as components: `AppShell`, `NavRail`, `TabBar` (with its More sheet), `SideNav`,
  `TopBar`, `PageHeader`, `ActionBar` and `SheetItem`, all reading one navigation list
  (`NavItem`, `NavGroup`, `groupItems`, `badgeText`).
- `Toaster` and the `toasts` store: at most two, paused on hover or focus, announced as status or
  alert, with an action whose key cap works as a hotkey.
- `matchesKey` and `isTypingTarget` for hotkeys; `TopBar` focuses its search on `/`.
- A high-contrast theme (`data-theme="contrast"`, and automatically under
  `prefers-contrast: more`): text at 7:1, edges and marks at 3:1.
- `ds-danger-fill`, the ground of a solid danger button, split from the `ds-danger` mark.
- `formatNumber`, `formatCompact` and `formatMoney` (major units, never cents), and `humanize` and
  `createLabels` for showing stored codes as words, with the content rules for both.
- `scripts/check-contrast.mjs`: every documented color pair is checked in every theme as part of
  lint.

### Changed

- Light theme: the success, warning and danger marks and the Low and Medium severity marks move to
  darker stops, so they meet 3:1 on every ground.
- Light theme: `ds-accent-strong` is darker, so a primary button's label stays above 4.5:1 on
  hover.
- `PageHeader` leaves the column's gap below itself.
- The gallery runs inside `AppShell`, with dark, light and high-contrast themes.

### Removed

- The static `preview.html` of every component that is now built; its card and the gallery cover
  it.

## [0.4.0] — 2026-10-14

### Added

- `Stat` and `StatRow`, `StatusBadge`, `Pane`, `Timeline`, `Meter`, `FilterRail` and
  `ActiveFilters`, and `Banner`.
- `Chip`, `Sheet` (on the native modal dialog), `SeverityBadge`, `SourceBadge`, `NewBadge` and
  `HelpTip` as components.
- The categorical palette `ds-cat-1`…`ds-cat-5`, and the `ds-accent-mixed` role.
- Helpers: `filtersToParams` / `filtersFromParams` for filter state in the URL, `formatRelative` /
  `formatExact` / `formatAge` for dates and times, and the severity order and names.
- Content rules for dates and times, and for missing values.

### Changed

- `Table` takes its ground and inset from its container (`--ds-table-bg`, `--ds-table-inset`), so
  it sits flush in a `Pane`.
- `HelpTip` shows its note on keyboard focus, not only on hover.

## [0.3.0] — 2026-10-14

### Added

- `Menu`: menu semantics, full keyboard support with typeahead, groups and separators, danger and
  disabled-with-reason items, a note-required marker, the top layer for clipping-proof placement,
  and a bottom-sheet presentation on phones. New dependency: `@floating-ui/dom`.

## [0.2.0] — 2026-10-14

### Added

- `Table`: sortable headers with `aria-sort`, checkbox selection with shift-click ranges, whole-row
  links, arrow-key row focus, columns that drop by priority on the table's own width, skeleton and
  empty states, and the missing-value mark.
- `Checkbox` (with a mixed state), `Radio` and `Switch`, on native inputs.
- `EmptyState` and `SkeletonLoader`.
- Content rule: a missing value is an em dash, announced as "No value".

## [0.1.0] — 2026-10-14

### Added

- The `darksite` package: Svelte 5 components, plus `darksite/tokens.css`, `darksite/base.css` and
  `darksite/tokens.json`. Products install a pinned tag from GitHub.
- `Button`, with `KeyCap` and `Spinner`.
- `base.css`: the global rules the components rely on — box sizing, the focus ring, reduced motion,
  the 16px touch font size, the `.ds-control` look and the shared keyframes.
- Roles `ds-accent-key`, `ds-accent-key-edge` and `ds-danger-strong`.
- A live gallery: `npm run dev`.
- stratt manages the lifecycle: `stratt all` to verify, `stratt release` to version and tag.

### Fixed

- A key cap on a primary button was 2.3:1 in light theme; it is now 9.4:1.
- Text selection in light theme was dark text on a dark ground.
