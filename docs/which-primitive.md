# Which primitive

Pick from this table before reaching for anything new. Every row is a decision already made.

| Need | Use | Notes |
|---|---|---|
| Commit, save, apply | `Button variant="primary"` | **One per view, right-most.** |
| The alternative next to it | `Button` (secondary, the default) | Accept all, Apply defaults. |
| A frequent low-risk toolbar action | `Button variant="ghost"` | Label plus a `keycap` on desktop. |
| An icon-only action | `Button variant="icon" label="…"` | `label` is required: it is the aria-label and the tooltip. |
| An irreversible action | `Button variant="danger"` → `Dialog` | Ghost red; the Dialog is the only confirmation. |
| Toggle a tag, a category, an attribute | `Chip selected onclick` | A key cap inside on a keyboard-driven view, a count inside in filters, `'mixed'` for a bulk partial. |
| An applied token or an active filter | `Chip removable` (`variant="token"` for tokens) | The × is its own 22px button (32 on touch). |
| Offer a value without applying it | `Chip suggestion source confidence` | **Dashed always means "suggested, not applied".** |
| A value that exists nowhere yet | `Chip suggestion isNew` / `NewBadge` | Check names, aliases and spelling variants first, so `new` means genuinely new. |
| Where a value came from | `SourceBadge` | One source per value — the most reliable that produced it — with its own confidence; the full list goes in the tooltip. |
| Explain a field, a row or a state | `HelpTip` / `Field tip` | An icon whose tooltip is the note. **No inline sentences.** |
| Pick one of 2–7 exclusive options | `SegmentedControl` | Density, a view mode, a three-way toggle. **Never a dropdown** for these. |
| Pick a severity | `SeverityPicker` | Scale order, mark stripes, dashed for suggested. |
| Pick from many, or create | `Combobox` | Owners, assignees, tags. The `Create "…"` row is always last, on ⇧Enter. |
| A labeled form control | `Field` + `Input` / `Combobox` / a native control | Field wires the id, the help/error text and `aria-describedby`. |
| A yes/no choice in a form | `Checkbox` | Also a table's selection column. A setting that applies at once is a `Switch`. |
| One of many in a form, when segments won't fit | `Radio` | More than seven options, or long labels. In a `<fieldset>`. |
| A setting that applies at once | `Switch` | No Save. The state is written beside the track. |
| Actions on one thing | `Menu` | A detail page's Actions, a row's overflow. A danger item opens a `Dialog`; a disabled one keeps its reason. |
| Reference info beside the work | `Popover` | A hotkey legend, saved views, the account menu. Non-modal; Esc closes; becomes a Sheet on phones. |
| Filters beside a list | `FilterRail` + `ActiveFilters` | Collapses rather than shrinks; a Sheet on phones; state in the URL. |
| A system-wide condition | `Banner` | Above the TopBar, pushing content down. Danger is never dismissible. |
| Filters, sort, any choice on touch | `Sheet` + `SheetItem` | Replaces Popover and Dialog under 768px. 44px rows. |
| Edit a record | `Sheet side="right"` | A drawer at ≥768px, a bottom sheet below. Footer: Cancel (secondary) then Save (primary), right-aligned. |
| Confirm after the fact | `toasts.push({ action })` | Brief; an action toast shows an m:ss countdown. Never more than two. A long-lived undo is not a toast. |
| Sections of one thing | `Tabs` | Counts inline; links mode for route sections. |
| A headline number | `Stat` in a `StatRow` | One value, one meta line. `severity` is the only color. |
| A proportion | `Meter` | Up to three segments, categorical colors, a legend. Not for loading. |
| A history of changes | `Timeline` | Sentences, relative times, batches, a recent slice with "Show all". |
| A static state | `StatusBadge` | Lifecycle, holds, markers. Never severity colors; never clickable. |
| A titled block on a content page | `Pane` | Unpadded so a Table sits flush. No primary button. |
| Rows and columns of records | `Table` | Sort, selection, row links, priority columns. Long lists end in "Load more". |
| A piece of media | `Card` in a `Grid` | No card chrome — the thumbnail **is** the card. |
| Images at their own aspect ratio | `JustifiedGrid` | Rows that fill the width, no crop. |
| A person or an organization | `EntityCard` in a `Grid min={280}` | A row with a 56px avatar. |
| The top of a page | `PageHeader` | Title, count, actions. No breadcrumbs, no hero. |
| Actions belonging to a pane | `ActionBar` | The pane's last child; never an overlay. |
| Nothing to show | `EmptyState` | One sentence, **one** action. |
| Loading content of known shape | `SkeletonLoader` | The same geometry as the real thing. `Spinner` is only for "Loading more…". |
| A preview row of media, several to a page | `Carousel` | One tab stop, ← / → between tiles; tile width follows Grid density. Link "See all" to a `Grid` page. |
| View images full screen | `Lightbox` | From a `JustifiedGrid` or `Grid`. ← / →, zoom, swipe; focus returns to the thumbnail. |

## The frame

| Need | Use | Notes |
|---|---|---|
| The application frame | `AppShell` | Rail plus content column; publishes the padding, chrome-bottom and top-bar heights. One per app. |
| Primary navigation, desktop | `NavRail` | 56 collapsed / 208 expanded, grouped, remembered per viewer. |
| Primary navigation, phone | `TabBar` | At most five cells; the fifth opens a `Sheet` with the rest. |
| Navigation inside a section | `SideNav` | 200px beside the page. A native `<select>` on phones. |
| A few sibling views of the same data | `Tabs` (links mode) inline in `PageHeader` | Only when all hold: about six sections at most; each is a view of the same data, not a settings page; and the pages are wide tables or grids that need the full width. Otherwise `SideNav`. |
| Something on every page of a section | `TopBar` | Search, a global create action, a scope selector. Page-specific actions go in `PageHeader` instead. |
| A page's own title and actions | `PageHeader` | Always flush; `TopBar` sits above it, outside the padded column. |
