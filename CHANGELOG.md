# Changelog

All notable changes to darksite are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.8.0] — 2026-10-15

### Added

- `formatDate` (and `DateOptions`, `isCalendarDate`): a date with no time. A calendar date
  (`'2026-10-01'`) shows as exactly that day in every time zone; a timestamp shows its day in the
  viewer's zone. The year follows the date rule — shown only when it isn't this year, or always
  with `year: 'always'`.
- `Missing`: the missing-value mark (an em dash in `ds-text-3`, announced "No value") as its own
  primitive. `Table` now renders it.
- `FactList` (and `FactItem`): label–value pairs on a native description list for detail panes,
  two columns from 560px, one below and stacked under 320px by its own width, with `mono`, `tip`,
  `wide`, per-item `cell` snippets and the `Missing` mark for empty values.
- `FileInput`: a secondary Button over a visually hidden native file input that stays the real
  control (keyboard, screen readers, forms), with the chosen name in mono, a "3 files" count with
  the list in a tooltip, Clear, and `accept`, `multiple`, `disabled`, `invalid`, `required`,
  `name`, `size`, bindable `files` and `onfiles`. Works inside `Field`.
- `Field` hands its control `labelId` as well; `SegmentedControl`, `Rating`, `ScalePicker` and
  `SeverityPicker` take `id`, `aria-labelledby` and `aria-describedby`, so a Field's label and
  help name and describe the group. `SegmentedControl`'s `label` is optional when
  `aria-labelledby` is given.
- `Dialog`: `initialFocus="field"` focuses the first field in the body. The panel is now a
  `novalidate` `<form>` whose submit is the confirm button, so Enter in a single-line field
  confirms (never while `confirmDisabled`). The Dialog card documents a confirmation that asks for
  a note with one or two `Field`s in its children.
- Button card: submitting a form from a Sheet or Dialog footer with `form`, and linking to a
  download or a server endpoint with the router's full-load escape hatch (`data-sveltekit-reload`).
- `Table` row groups: `groupBy`, `groupLabel` and a `group` header snippet put rows under sticky
  `rowgroup` header rows with a count, inside one table (one `<tbody>` per group). Rows show group
  by group and the arrow keys follow that order. `TableGroup` type.
- `Table` row marks: `rowTone` (`accent`, `success`, `warning`, `danger`) and `rowSeverity` draw a
  3px leading stripe on a row. `TableRowTone` type.
- `Table hideBelow` moves the column-priority thresholds per table (`{ 2: 640, 3: 960 }`); the
  table then measures its own width. `hiddenPriorities` and `TablePriorityWidths` are exported.
- `Pane collapsible`, with a bindable `open` and `collapseBelow` (start collapsed when the pane
  mounts narrower than that): the title becomes a disclosure button with `aria-expanded`.
- `StatusBadge until`: "· in 3 days", "· due today", "· 2 days overdue" against a due date, with
  the tone following the date (danger once overdue, warning on the day) unless one is given.
  `daysUntil` and `formatDue` are exported.
- `PageHeader mono` for a title that is an identifier.
- The contrast checker covers the row marks on a pane's ground (`ds-accent` and the severity marks
  on `ds-bg-2`); Critical on `ds-bg-2` joins the documented dark-theme Critical shortfall.
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
- `AppShell` `headerActions` snippet: shell-wide controls (usually a global search) rendered by
  every level-1 `PageHeader` on its own line, right-aligned, ahead of the page's `actions`. Pages
  need no changes; a page without a `PageHeader` shows none. `headerActionsKey` (default `/`)
  focuses its first field. On phones it collapses to an icon button (`headerActionsIcon`,
  `headerActionsLabel`, default a search icon and "Search") that opens a full-width row under the
  header (the key opens it too); Esc from inside the row, or a navigation, closes it.
- `PageHeader` `shellActions` (default true): `false` leaves the shell's header actions out of one
  page.
- `focusShortcut(key = '/')` attachment: a key that focuses the first field inside an element,
  standing aside while the user types or when the press was already handled. `TopBar` now uses it,
  with no change in behavior.
- `tooltip(text)` attachment: an accessible tooltip for any focusable element — hover, keyboard
  focus and long press; it describes the element unless it is already its name; Esc hides it.
  `Button` uses it for an icon button's label and for any `title`, instead of the browser's
  native title.
- `LoadMore`: the foot of a long list — "Showing 50 of 295" and a Load more button; a keyboard
  press moves focus to the first new row through `focusRow(index)`.
- `Textarea` and `Select`, taking the same `Field` contract as `Input`; `Select` is a native
  select with a chevron, a "Choose…" prompt and option groups.
- `setStrings` and `strings`: every word darksite shows or speaks on its own — labels,
  announcements and the relative time words — in one table a product can translate.
- `Banner dismissed` (bindable), so a dismissal the server knows (a cookie) never flashes.
- `Dialog role`: `alertdialog` for a danger question, `dialog` for a default-tone confirmation or
  one that asks for a note; it now follows `tone` by default.
- Tokens `ds-media-scrim` and `ds-on-media`, for text and icons laid over an image.
- `badgeSpoken`, `toDate`, `formatDueExact`, `DEFAULT_PRIORITY_WIDTHS` and `ParamsInput` are
  exported, and `darksite/package.json` is importable.
- `plus` and `minus` as key names (`keycap="plus"` shows `+`).
- Prose links (`a` without a component's own styling) in `ds-accent-text`, underlined.
- Tests in a real browser (Chromium) for the dialogs, menus, popovers, the combobox list, tooltips,
  column priorities and the justified grid, and a server-render test of every component. Run
  `npx playwright install chromium` once before `stratt test`.

### Changed

- `Button` is typed with every native `<button>` and `<a>` attribute (`form`, `name`, `value`,
  `download`, `target`, `rel`, `data-*`), all passed through. They already reached the element at
  run time; the types now accept them.
- A button inside a `Dialog`'s children must be `type="button"` (`Button`'s default); a native
  `<button>` without a type now confirms the dialog.
- `filtersFromParams` keeps URL values a section's options do not list instead of dropping them
  (a linked view keeps its filters while options are partial or loading); `strict: true` on a
  section restores dropping. It also trims values, drops empty ones, and keeps one value for a
  `text` section. `FilterRail` shows such values as checked rows and `ActiveFilters` as chips,
  labeled by `labelFor(value)` or the value itself; free text is quoted in its chip.
- `FilterSection.options` is optional (a `text` section has none); code that reads
  `section.options` directly needs `?? []`.
- `HelpTip` is a button described by its note: it shows on hover, on focus by keyboard or tap,
  toggles on click or tap, and hides on Esc; its hit area is 24px (44 on touch) and its note stays
  inside the viewport. It takes a `label` (default "More information").
- `Toaster` announces through two live regions that exist before any toast and travel with the
  queue into an open modal, so every toast is spoken, with its action and key.
- Touch targets: NavRail and SideNav rows, underline `Tabs`, `Toaster` buttons and the `Combobox`
  chevron are 44px under a coarse pointer.
- Focus rings: `Tabs` inset (-2px), `SegmentedControl` at 0 and `Card` at 3px, so a scrolling strip
  does not clip them.
- `Carousel`: Tab walks every control in the current tile; a control added later joins the order.
- Muted text steps up to `ds-text-2` on the brighter grounds (hover, active and token states in
  `Combobox`, `Chip`, `NavRail`, `SegmentedControl` and `ListRow`); `ds-text-3` stops at
  `ds-bg-3`, as documented.
- `Card` overlays use the new media scrim: white text over an image holds 4.5:1 in every theme
  (it was 3.3:1 in light).
- `Grid label` names a group (it was a list without list items); `ActionBar` is a group, not a
  toolbar.
- Badges are read once: the visible count is hidden from assistive technology and a dot reads
  "new".
- The rail no longer animates its width as the page loads; only a toggle animates.
- `humanize` keeps acronyms (`HTTPError` → "HTTP error") and lowercases shouted codes.
- `npm run lint` (so `stratt all`) also builds the package and runs publint.

### Fixed

- A bare calendar date (`'2026-10-01'`) is no longer read as UTC midnight, which showed the day
  before west of UTC: `formatRelative` counts whole days for it ("today", "2 days ago"),
  `formatExact` gives its full date with no time or zone, and `formatAge` (so `StatusBadge since`)
  ages it from local midnight.
- `formatRelative` decides "this year" in the `timeZone` it was given, not the runtime's.
- `formatMoney` with only `maximumFractionDigits` (such as `0` for whole units) or only
  `minimumFractionDigits` fits the other bound to it instead of throwing a `RangeError` against
  the currency's default; a contradictory pair is clamped.
- `Stepper`: an arrow or page key after typing a value steps from the typed value.
- `Table`: after the rows shrink, one row stays in the tab order.
- Page hotkeys work while a checkbox, radio or button has focus; only text entry counts as typing.
- `Dialog` and `Sheet` close on the scrim only for a press that starts and ends there, not a text
  selection dragged out of the panel.
- `Sheet` returns focus to its trigger when it closes.
- `FilterRail` Clear all empties text typed into a filter but not yet applied.
- `Timeline` ids are unique per instance, and a calendar date's `datetime` is the bare date.
- `Menu` stacks above sticky headers where the popover top layer is unavailable.
- The release job checks that the tag matches `package.json` before attaching the tarball, and
  runs publint.

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
