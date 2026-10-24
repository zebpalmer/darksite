# To do

Gaps found while adopting darksite in an operator tool with dense tables, a dashboard and an admin
area. Everything here is general to operator software.

## How to deliver a primitive

For each new primitive below:

1. A card in `components/<Name>/`: `README.md` (purpose, geometry, states, what the consumer
   provides, don'ts), in the same shape as the existing cards.
2. A row in [`docs/which-primitive.md`](docs/which-primitive.md).
3. A **Svelte 5 implementation** (runes, snippets, `$bindable`) in the darksite package, which
   products install at a pinned version (decided 14 October 2026). The existing cards are already
   written in Svelte terms; the implementation is what stops each product writing its own and
   drifting.

Every primitive keeps the system's standing rules: `ds-*` roles only, nothing below 12px or above
weight 500, a visible `:focus-visible`, 44px under `(pointer: coarse)` matching the size selector
([`density.md`](docs/density.md)), container queries rather than viewport breakpoints, motion
zeroed under `prefers-reduced-motion`, and no meaning carried by color alone.

## New primitives

Ordered by what adopters are blocked on first.

### 1. Table

Done in 0.2.0 (`src/lib/components/Table.svelte`). The header sticks in a work view only: a
horizontal scroll container cannot pass a sticky header up to the document (see the card).

The biggest gap. `Grid` is for card grids, and most operator screens are rows and columns.

- [x] **Geometry.** Header row 34px, body rows 40px at desktop density, 32px with `density="dense"`,
  44px under `(pointer: coarse)` whatever density was passed. 12px horizontal cell padding, with
  the first and last columns aligned to the pane's own inset so a table sits flush in a pane. Row
  dividers `ds-border-subtle`, header divider `ds-border`, header text 12/500 `ds-text-3`.
- [x] **Scroll.** The table owns its horizontal scroll inside its container, so a wide table never
  widens the page. The header is sticky to the top of whichever element owns the vertical scroll
  (the pane in a work view, the document in a content page).
- [x] **Columns.** Each column declares `key`, `label`, `align` (`start` | `end`, numbers end),
  `width` (optional), `priority` (1 = never hidden … 3 = first to drop) and `mono` (serials,
  hashes, paths, in `mono-control` with tabular figures). Low-priority columns drop by **container
  query** as the table narrows, never by viewport breakpoint. Cells are single-line with an
  ellipsis and a `title` holding the full value, and no long string sets a column's width.
- [x] **Sorting.** A sortable header is a button with `aria-sort`, a 16px Lucide sort icon, and a
  keyboard path (Enter or Space). One sort key at a time; the consumer owns the data and receives
  `onsort({ key, direction })`.
- [x] **Selection.** Optional. A leading checkbox column using the new `Checkbox` (item 2); the
  header checkbox goes mixed when some rows are selected. Shift-click selects a range. A selected
  row takes `ds-accent-tint`. The selection count and the bulk actions live in the pane's
  `ActionBar`, never in a floating toolbar ("same zones, different density").
- [x] **Row link.** Optional `href(row)` makes the whole row navigable: pointer click, and Enter
  when the row has keyboard focus. Interactive controls inside a row (a checkbox, a button) do not
  trigger the row link.
- [x] **Keyboard.** Arrow up and down move a row focus; Space toggles selection; Enter opens the
  row. Visible focus on the focused row. Page hotkeys keep the rules in
  [`focus-and-hotkeys.md`](docs/focus-and-hotkeys.md).
- [x] **States.** Loading uses `SkeletonLoader` rows of the real geometry. Empty uses
  `EmptyState` inside the table's frame. A cell with no value follows the missing-value rule
  (content rules, below).
- [x] **Consumer provides:** `rows`, `columns`, `rowKey`, `density`, `selectable`,
  `selected` (bindable set of keys), `sort` (bindable `{ key, direction }`), `onsort`, `href`,
  a `cell` snippet for custom cells (a `StatusBadge`, a `SourceBadge`, a person), `empty` snippet,
  `loading`, `label` (the table's accessible name), `class`.
- [x] **Don'ts.** Don't paginate inside the table (item 11). Don't let a cell wrap to a second line.
  Don't hide a priority-1 column. Don't use a Table for media (`Grid` + `Card`).

### 2. Checkbox, Radio and Switch

Done in 0.2.0.

`Field` says "a native control", but there is no card for their look, touch target or the
indeterminate state that `Table` selection and `Chip`'s `'mixed'` already imply.

- [x] **Checkbox.** 16px box at `ds-radius-xs`, `ds-bg-3` with a `ds-border-strong` edge; checked
  and mixed fill with `ds-accent` and draw the tick or dash in `ds-accent-contrast`. The hit area
  is 32px on desktop and 44px on touch even though the box stays 16px. Built on a native
  `<input type="checkbox">` so forms and screen readers work; `indeterminate` set from a
  `checked="mixed"` prop.
- [x] **Radio.** The same geometry, round, for a choice inside a form where a `SegmentedControl`
  would not fit (more than seven options or long labels).
- [x] **Switch.** For a setting that takes effect immediately with no Save. 32×18 track, `ds-bg-5`
  off and `ds-accent` on, with the state also written as a label ("On" / "Off") or carried by the
  field label so color is not the only signal. `role="switch"` with `aria-checked`.
- [x] **All three** sit in a `Field` (label beside the control, `layout="row"` style) and support
  `disabled` at 45% and `invalid`.
- [x] **Don'ts.** Don't use a Switch for something that needs Save; that is a Checkbox. Don't style
  a bare global `input` and hope checkboxes survive it.

### 3. Menu

Done in 0.3.0. It uses the native `popover` top layer where supported and `@floating-ui/dom` to
position beside its trigger; under 768px it presents as a bottom sheet itself, until `Sheet` is
built.

`Popover` mentions "a small menu", but nothing provides menu semantics. Detail pages need one
Actions menu, and every product will otherwise hand-roll it.

- [x] **Behavior.** `role="menu"` with `menuitem` children; opens from a `Button` trigger; arrow
  keys move, Home and End jump, typeahead on the first letter, Enter or Space activates, Esc closes
  and returns focus to the trigger. Non-modal, like `Popover`. A `Sheet` with `SheetItem` rows on
  phones.
- [x] **Items.** 32px rows (44 on touch), a 16px leading icon, the label, and an optional trailing
  `KeyCap`. Separators and optional group titles. A **danger** item in `ds-danger-text`, whose
  activation opens the `Dialog` rather than acting. A **disabled** item that stays visible and
  carries its reason in a tooltip, because in an actions menu the reason is the useful part.
- [x] **Note-required marker.** An item can declare that it will ask for a note, shown as a small
  trailing icon with a tooltip, so the operator knows before choosing it.
- [x] **Consumer provides:** `trigger` snippet (attributes to spread, as `Popover` does),
  `items` (`{ id, label, icon?, keycap?, tone?: 'danger', disabled?, reason?, needsNote?,
  onselect }` plus `{ separator: true }` and `{ group }`), `open` (bindable), `placement`, `label`.
- [x] **Don'ts.** Don't remove an item a role cannot use from an actions menu without saying why
  elsewhere; disable it with its reason. (Navigation is different: there, remove it.) Don't nest
  submenus.

### 4. Stat

Done in 0.4.0.

A headline number. Dashboards and report summaries need it, and today each one invents a tile.

- [x] **Content.** A `label` (13px `ds-text-2`), a `value` (24/500, tabular figures), an optional
  `unit` or "of N" after the value (13px `ds-text-3`), and **one** `meta` line (12px `ds-text-3`)
  that breaks the number down ("185 open · 78 in progress · 24 blocked").
- [x] **Surface.** `ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`, 12px by 14px
  padding. No shadow, no icon, no sparkline in the first version.
- [x] **As a link.** `href` makes the whole tile a link with hover `ds-bg-3` and the focus ring.
  A stat that links nowhere should be rare.
- [x] **Attention.** An optional `severity` adds the severity mark as a 3px leading stripe and puts
  a `SeverityBadge` in the meta line, following [`severity.md`](docs/severity.md). There is no other
  way to color a Stat.
- [x] **Layout.** A row of stats uses a container-driven grid (2 to 4 across by available width).
- [x] **Don'ts.** Don't put two numbers in `value`. Don't write a sentence in `meta`.

### 5. StatusBadge

Done in 0.4.0.

A static, non-interactive state: lifecycle states, holds, "Primary". `SeverityBadge` is ordered
and reserved, `Chip` is interactive, and `SourceBadge` and `NewBadge` are single-purpose, so plain
state has nowhere to go.

- [x] **Geometry.** 22px tall (it is not a control, so it does not grow on touch), 7px inline
  padding, `ds-radius-xs`, 12/500 text, optional 14px leading Lucide icon.
- [x] **Tones.** `neutral` (a `ds-border` edge, `ds-text-2`), `accent` (a `ds-accent` edge,
  `ds-accent-text`, for a marker such as "Primary"), `success`, `warning` and `danger` (each its
  `-tint` ground and `-text` ink), and `muted` (`ds-text-3`, for out-of-service states). **Never
  severity colors.**
- [x] **Duration.** An optional `since` date renders "· 12 days" after the label in mono, for a
  hold or a state that ages.
- [x] **Don'ts.** Don't make it clickable; a clickable state is a `Chip`. Don't use a dashed edge;
  dashed means suggested.

### 6. Pane

Done in 0.4.0.

A titled block inside a content page: a dashboard section, a block on a detail page.
[`layout.md`](docs/layout.md) defines panes for work views, but a content page that stacks a few
titled blocks has no primitive and no stated geometry.

- [x] **Header.** 44px: a title in `card-title` (14/500), optional `meta` (13px `ds-text-3`), an
  optional `HelpTip`, and an `end` snippet for one link or one secondary action. Sentence case, no
  uppercase.
- [x] **Body.** Unpadded by default so a `Table` or list sits flush; `padded` for prose or a form.
  An optional `footer` snippet with a `ds-border-subtle` top edge.
- [x] **Surface.** `ds-bg-2`, a `ds-border-subtle` edge, `ds-radius-md`, no shadow.
- [x] **Don'ts.** Don't nest a Pane in a Pane. Don't give it a primary button; the page's primary
  action lives in `PageHeader`.

### 7. Timeline

Done in 0.4.0.

An audit or activity history, on a detail page and on a dashboard.

- [x] **Entry.** Actor, verb, object ("A. Rivera assigned R-00412 to M. Lund"),
  then an optional detail line in 13px `ds-text-3`. Identifiers inside the sentence in mono. A
  system actor (a sync job, an import) shows a `SourceBadge` instead of a person.
- [x] **Time.** Relative ("6 min ago") on the right, with the exact time in a tooltip, following
  the dates-and-times content rule.
- [x] **Batching.** Consecutive entries with the same actor, action and request collapse into one
  ("set 55 records to Ready"), expandable to the individual entries.
- [x] **Length.** Shows a recent slice with a "Show all" link to the full history; never an
  unbounded list.
- [x] **Consumer provides:** `entries` (`{ id, at, actor, source?, verb, object, detail?,
  batchKey? }`), `limit`, `allHref`, an `entry` snippet for custom rendering.

### 8. Meter

Done in 0.4.0.

A determinate proportion bar. `Spinner` and `SkeletonLoader` cover indeterminate loading only.

- [x] **Shape.** 6px tall, `ds-bg-4` track, rounded ends, up to three segments, and an optional
  legend underneath (an 8px swatch plus label and count per segment, 12px).
- [x] **Color.** Segments take the categorical palette (Tokens, below) by default, or a semantic
  tone when the segment means one (success for "done" in a progress meter).
- [x] **Accessibility.** `role="meter"` (or `progressbar` for progress) with `aria-valuenow`,
  `aria-valuemax` and a text alternative that states each segment.
- [x] **Don'ts.** Don't use it for loading. Don't exceed three segments; that is a chart.

### 9. FilterRail

Done in 0.4.0, with `ActiveFilters`. URL state is the documented default through
`filtersToParams` / `filtersFromParams`; a library component cannot own the router.

[`layout.md`](docs/layout.md) specifies it (240 to 280px, its own scroll, collapses rather than
shrinks, a `Sheet` on phones) but there is no card.

- [x] **Card and implementation** for the rail as specified, with grouped filter sections, a
  count of active filters on its collapse toggle, and a "Clear all" in its header.
- [x] **Active filters** also render as removable `Chip`s above the results, so a collapsed rail
  never hides what is applied.
- [x] **State in the URL** by default, so a filtered view can be linked and survives a reload.

### 10. Banner

Done in 0.4.0.

The stacking table reserves z-index 80 for a "full-width announcement bar", but there is no card.
It is the missing home for a system-level condition the user must know about but that belongs to
no field: "The nightly sync has failed for 3 hours", "Read-only maintenance from 18:00".

- [x] **Placement.** Full width above the `TopBar`, inside the shell, pushing content down rather
  than overlaying it.
- [x] **Tones.** `info`, `warning`, `danger`, each with an icon and a message of one sentence, plus
  at most one action (a link or a button).
- [x] **Dismissal.** Optional, and remembered per viewer per banner id. A `danger` banner is not
  dismissible while its condition holds.
- [x] **Accessibility.** `role="status"` for info and warning, `role="alert"` for danger.

### 11. Pagination or "load more"

No stated convention for long lists. `Spinner` mentions "Loading more…", which implies incremental
loading, but neither the trigger nor how it combines with selection is written down.

- [x] **Pick one convention** for tables and lists and write it into
  [`layout.md`](docs/layout.md): either a page footer ("1–50 of 295", previous and next, page size)
  or a "Load more" button that appends.
- [x] **Selection across pages.** Say what "select all" means when not every row is loaded
  ("Select all 295" as a second step, as mail clients do).
- [x] **Keyboard focus** stays on the last focused row when more rows arrive.
- Decided: "Load more", written into [`layout.md`](docs/layout.md) under "Long lists". A list whose pages
  must each have a URL (a public listing people link to) ends in a `Pager` instead (added after
  0.11.0).

## Component changes

### NavRail: a more flexible default

Done in 0.23.0.

The rail's defaults suit most products, but two of them are fixed in code, and adopting the rail
in a product that already has its own rail resets each viewer's remembered choice.

- [x] **`expandAt` prop.** With nothing stored, the rail starts expanded at 1440px and collapsed
  below; the 1440 is hard-coded in a `matchMedia` call. Take `expandAt` (a width in px, default
  1440) so a product can pick its own breakpoint, with `false` meaning "start collapsed at any
  width" (unlike `pinned`, the toggle stays). Mirror it on `AppShell` as `railExpandAt`.
- [x] **`storageKey` prop.** `rememberAs` always stores under `darksite:rail:<rememberAs>`. A full
  `storageKey` (taking precedence over `rememberAs`) lets a product that already remembers this
  choice keep its existing key, so viewers keep their setting through the switch. Mirror it on
  `AppShell`.
- [x] **Document the width tokens as the override point.** The `NavRail` and `AppShell` cards name
  `ds-rail-w` and `ds-rail-w-expanded` but never say a product may override them (for example a
  240px expanded rail for longer labels). Say so in both cards and in [`shell.md`](docs/shell.md),
  with the rule that the collapsed width stays at 56px so the 40×36 items still fit.

## Rules to amend

- [x] **Section tabs for full-width data views.** `which-primitive.md` and the `SideNav` card say
  navigation inside a section is a `SideNav`, "never a tab strip above it". That is right for
  settings and admin areas with many pages. It is wrong for a small set of sibling **data views**
  whose tables need the full width, such as a reports section with five views of
  the same records. Allow `Tabs` in links mode, inline in the `PageHeader`, as section navigation when
  all of these hold: at most about six sections, each is a view of the same data rather than a
  separate settings page, and the pages are wide tables or grids. Write the test into both
  documents so the choice is not made per product.
- [x] **EmptyState uses a dashed edge**, but `which-primitive.md` says "dashed always means
  suggested, not applied". Give EmptyState a solid `ds-border-subtle` edge, or write the exception
  into the rule.
- [x] **Popover titles are 12px uppercase**, but the README allows capitals only on the 11px
  navigation group titles. Change one of the two.
- [x] **The light theme breaks "High and `ds-danger` are the same color".** In light,
  `ds-sev-high` moves to `color-error-600` while `ds-danger` stays on `color-error-500`;
  `ds-success` and `ds-warning` likewise keep their dark marks while `ds-sev-low` and
  `ds-sev-medium` move to `-600`. Decide whether the role marks follow, then recompute the mark
  contrast on the light grounds.
  Resolved: the roles do not follow. On `color-error-600` the solid danger button's label would drop
  to 4.4:1, so `ds-danger` stays put and [`severity.md`](docs/severity.md) now explains the split.
  The recompute found the light-theme marks problem below.

## Accessibility

- [x] **Announce toasts.** Only `Spinner` mentions a live region. The `Toaster` card should
  specify `role="status"` (polite) for results and `role="alert"` for failures, so a screen reader
  hears "Saved as your default", not just a sighted user.
- [x] **Semantic marks in light theme are below 3:1.** Fixed in 0.5.0: the light marks moved to the
  -700 / error-600 stops (3.5:1 and up), and a solid danger button has its own `ds-danger-fill`. Was: `ds-success`, `ds-warning` and `ds-danger`
  measure 1.9–3.0:1 against the light grounds, and Low and Medium severity 2.9–3.0:1 on the light
  page ground. Text roles are fine. Needs a light-theme mark stop that holds 3:1 without moving
  `ds-danger`'s fill (see the README's Accessibility section).
- [x] **High-contrast theme.** Added in 0.5.0: `data-theme="contrast"`, also applied under
  `prefers-contrast: more`. `scripts/check-contrast.mjs` verifies it in lint. Was: The README recommends one for strict conformance (borders at 3:1,
  text at 7:1) but does not provide it.

## Content rules

- [x] **Dates and times.** Decided in 0.4.0 (README, Content fundamentals; `formatRelative`,
  `formatExact`). Was: When to show relative ("6 min ago") and when absolute ("14 Oct, 14:51"),
  which time zone is shown and how it is labeled, the exact value in a tooltip, and the date order.
  Every operator screen shows timestamps, and none of the docs say how.
- [x] **Missing values.** Decided in 0.2.0: an em dash in `ds-text-3`, announced as "No value"
  (the Table card). Was: One rule for an empty cell or field: an em dash, "Unknown", or blank.
  This matters most in tables, where a blank reads as still loading.
- [x] **Numbers and money.** Decided in 0.5.0 (README; `formatNumber`, `formatCompact`,
  `formatMoney`). Was: `PageHeader` says counts are localized. Extend that to thousands
  separators, currency, and when to abbreviate (12.4k).
- [x] **Code values to labels.** Decided in 0.5.0 (README; `createLabels`). Was: A rule that stored codes (`missing_start_date`, `in_progress`) are
  never shown raw, and each product keeps one label map rather than formatting at each call site.

## Tokens

- [x] **A categorical palette.** Done in 0.4.0: `ds-cat-1`…`ds-cat-5`. Was: Meters and charts need four to six colors that are neither the
  accent nor semantic nor severity, with a light-theme set and contrast against `ds-bg-2`. Today
  the only choices would break one of those reservations.

## Distribution

- [x] **Svelte 5 implementations of the existing primitives** as well as the new ones, in the
  package (see "How to deliver a primitive"). Done in 0.6.0: every card has a component.
- [x] **A Svelte package with versioned releases, managed by stratt.** Done since 0.1.0: products
  install a pinned tag. Was: A product that cannot fetch a private repo at build time vendors
  `tokens.css` and the components. Tags and a short changelog would let it record which version it
  copied and see what changed since.
