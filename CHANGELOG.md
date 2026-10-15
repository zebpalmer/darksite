# Changelog

All notable changes to darksite are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
