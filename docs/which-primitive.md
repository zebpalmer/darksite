# Which primitive

Pick from this table before reaching for anything new. Every row is a decision already made.

| Need | Use | Notes |
|---|---|---|
| Commit, save, apply | `Button variant="primary"` | **One per view, right-most.** |
| The alternative next to it | `Button` (secondary, the default) | Accept all, Apply defaults. |
| A frequent low-risk toolbar action | `Button variant="ghost"` | Label plus a `keycap` on desktop. |
| An icon-only action | `Button variant="icon" label="…"` | `label` is required: it is the aria-label and the tooltip. |
| A short label or note on a control | `{@attach tooltip('…')}` / `Button title` | Hover, keyboard focus and long press; it describes the control. Never something the user must read to act. |
| An action not available yet, and why | `Button disabled reason="…"` | Stays focusable; the reason is its tooltip. Short: what would enable it. |
| An irreversible action | `Button variant="danger"` → `Dialog` | Ghost red; the Dialog is the only confirmation. |
| A welcome or sign-up moment | `Dialog size="hero"` | 520px, centered, an optional `mark` (icon or logo) over the heading, a sentence or two and at most a short form; the primary stacked over a quiet Cancel; a bottom sheet on phones. Once, never on every visit. |
| Confirm, and record why | `Dialog` with one or two `Field`s | `initialFocus="field"`, `confirmDisabled` until valid; Enter confirms. More fields is a `Sheet`. |
| Submit a form from a Sheet or Dialog footer | `Button type="submit" form="…"` | The form's `id`; Enter in a field submits too. |
| A link to a download or a server endpoint | `Button href download data-sveltekit-reload` | The router's full-load escape hatch, or it fetches the file as a page. |
| Toggle a tag, a category, an attribute | `Chip selected onclick` | A key cap inside on a keyboard-driven view, a count inside in filters, `'mixed'` for a bulk partial. |
| An applied token or an active filter | `Chip removable` (`variant="token"` for tokens) | The × is its own 22px button (32 on touch). |
| Offer a value without applying it | `Chip suggestion source confidence` | **Dashed means not confirmed: suggested, not applied.** |
| A value that exists nowhere yet | `Chip suggestion isNew` / `NewBadge` | Check names, aliases and spelling variants first, so `new` means genuinely new. |
| Where a value came from | `SourceBadge` | One source per value — the most reliable that produced it — with its own confidence; the full list goes in the tooltip. |
| The viewer's dark, light, reading or high-contrast mode | `ModePicker` | Drives the `mode` store; `MODE_SCRIPT` in `app.html` avoids a flash on load. |
| Flip between dark and light | `ThemeToggle` | One icon button; the label names the action. `mode.init({ fallback })` and `modeScript(fallback)` pick the mode before the viewer does. The full set stays `ModePicker`. |
| A product's own colors and fonts | A brand: `darksite/brands/<name>.css`, or `npx darksite-theme` | Never hand-written `--ds-*` overrides; the generator covers every role and mode and checks contrast. |
| Long-form reading | `ds-reading` in a `paper` or `night` region | The reading font at a readable size and measure. |
| Explain a field, a row or a state | `HelpTip` / `Field tip` | An icon whose tooltip is the note. **No inline sentences.** |
| Pick one of 2–7 exclusive options | `SegmentedControl` | Density, a view mode, a three-way toggle. **Never a dropdown** for these. |
| Pick a severity | `SeverityPicker` | Scale order, mark stripes, dashed for suggested. |
| Search a whole site: people, records, docs | `SearchPalette` | A modal: grouped results, scope chips, ↑/↓ and Enter; rows are links. Opened by a bar Button or a field-shaped button, and `searchShortcut` (`/`, ⌘K). Picking a value in a form is a `Combobox`. |
| Pick from many, or create | `Combobox` | Owners, assignees, tags. The `Create "…"` row is always last, on ⇧Enter. |
| A labeled form control | `Field` + `Input` / `Combobox` / a native control | Field wires the id, the help/error text and `aria-describedby`. A group control (`SegmentedControl`, `Rating`, a picker) takes `aria-labelledby={f.labelId}`. |
| Multi-line text in a form | `Textarea` in a `Field` | The Field contract, like `Input`. |
| One choice from a list in a form | `Select` in a `Field` | Native, with a chevron. Searchable or creatable is a `Combobox`; 2–7 visible options a `SegmentedControl`. |
| Choose a file to upload or import | `FileInput` in a `Field` | A Button over the native input; the name in mono; Clear. |
| A yes/no choice in a form | `Checkbox` | Also a table's selection column. A setting that applies at once is a `Switch`. |
| One of many in a form, when segments won't fit | `Radio` | More than seven options, or long labels. In a `<fieldset>`. |
| A setting that applies at once | `Switch` | No Save. The state is written beside the track. |
| Actions on one thing | `Menu` | A detail page's Actions, a row's overflow. A danger item opens a `Dialog`; a disabled one keeps its reason. |
| Reference info beside the work | `Popover` | A hotkey legend, saved views, the account menu. Non-modal; Esc closes; becomes a Sheet on phones. |
| Filters beside a list | `FilterRail` + `ActiveFilters` | Collapses rather than shrinks; a Sheet on phones; state in the URL. |
| Filter by free text, or by one of many | `FilterRail` section `type: 'text'` / `type: 'search'` | Text applies on Enter or blur; search is a Combobox with chips. Unlisted URL values stay, with `labelFor`. |
| A whole work view | `WorkView` | PageHeader, a rail beside the results, the results as the one scroller, an ActionBar. Sizes itself inside `AppShell`. |
| A system-wide condition | `Banner` | Above the TopBar, pushing content down. Danger is never dismissible. |
| Filters, sort, any choice on touch | `Sheet` + `SheetItem` | Replaces Popover and Dialog under 768px. 44px rows. |
| Edit a record | `Sheet side="right"` | A drawer at ≥768px, a bottom sheet below. Footer: Cancel (secondary) then Save (primary), right-aligned. |
| Confirm after the fact | `toasts.push({ action })` | Brief; an action toast shows an m:ss countdown. Never more than two. A long-lived undo is not a toast. |
| Sections of one thing | `Tabs` | Counts inline; links mode for route sections. |
| A headline number | `Stat` in a `StatRow` | One value, one meta line. `severity` or a scale `level` is the only color. |
| A status on the app's own scale, as a headline | `Stat scale level` | The stop's name is the value, on its stripe; beside a value of its own, a `ScaleBadge` in the meta line. |
| A headline count broken down by level | `Stat scale levels` | "Medium 2 · Critical 4": a `ScaleBadge` and a count per stop in the meta line, in scale order, wrapping whole in a narrow tile. The stripe stays `level`'s or `severity`'s. |
| A proportion | `Meter` | Up to three segments, categorical colors, a legend. Not for loading. A standalone whole is a `Ring`. |
| A history of changes | `Timeline` | Sentences, relative times, batches, a recent slice with "Show all". |
| A static state | `StatusBadge` | Lifecycle, holds, markers. Never severity colors; never clickable. |
| A titled block on a content page | `Pane` | Unpadded so a Table sits flush. No primary button. |
| The facts about one record | `FactList` | Label–value pairs on a detail pane; two columns that stack by its own width. Many records → `Table`. |
| A value that is absent | `Missing` | An em dash in `ds-text-3`, announced "No value". `Table` and `FactList` draw it already. |
| A calendar date (no time) | `formatDate` | The same day in every time zone; the year only when it isn't this year. A timestamp is `formatRelative`. |
| Rows and columns of records | `Table` | Sort, selection, row links, priority columns. Long lists end in "Load more" (a `Pager` when each page needs a URL). |
| The end of a long table or list | `LoadMore` | "Showing 50 of 295" and a Load more button; rows append; keyboard focus moves into the new rows. |
| Records in groups, one set of columns | `Table groupBy` | Header rows with counts inside one table — not a Pane and a Table per group. |
| A ledger: rows read across many figures | `Table striped` | Every second row a faint stripe, restarting in each group. Most tables need only their dividers. |
| A row that needs to stand out | `Table rowTone` / `rowSeverity` | A 3px leading stripe; the row still says it in a badge. Exceptions only. |
| A wide table beside a rail | `Table hideBelow` | Move the priority 2 / 3 thresholds so it drops columns sooner. |
| A secondary block that can fold away | `Pane collapsible` | A disclosure in the heading; `collapseBelow` starts it closed on a narrow column. |
| A state with a due date | `StatusBadge until` | "· in 3 days", "· 2 days overdue"; danger once overdue unless a tone is given. |
| A page about one identifier | `PageHeader mono` | The title in mono, like every other identifier. |
| A piece of media (the optional media set) | `Card` in a `Grid` | No card chrome — the thumbnail **is** the card. |
| Images at their own aspect ratio | `JustifiedGrid` | Rows that fill the width, no crop. |
| A person or an organization | `EntityCard` in a `Grid min={280}` | A row with a 56px avatar. |
| The top of a page | `PageHeader` | Title, count, actions. No breadcrumbs, no hero. |
| The start of a product or a section | `Intro`, then `Steps` and `LinkCard`s in a `Grid min={260}` | The overview page type: a sentence or two, up to two actions. Never on a work or list page. |
| Numbered steps to get started | `Steps` | An ordered list, one step per line; `variant="cards"` for tiles three or four across. |
| A destination on an overview page | `LinkCard` | A whole-card link: icon, title, a sentence, an arrow. |
| Help, a how-to, a method note | `PageHeader` + `<article class="ds-prose">` | The document page type: prose at a readable measure. |
| A post on a public site: a blog or news article | `<article class="ds-article">` | Its own header (`ds-article-kicker`, title, `ds-article-summary`, `ds-article-meta`) instead of a PageHeader; 720px text, `ds-article-wide` breaks out to 1120px. |
| A post from the Ghost CMS | `<article class="ds-article ds-article-ghost" {@attach ghostCards}>` | Opt-in: maps every card Ghost renders on the web (images, galleries, bookmarks, callouts, embeds, buttons, headers, files, products, calls to action, signup forms, toggles, audio, video, quotes, code) and its widths; `ghostCards` adds the toggles, native media controls, justified galleries and embed ratios. |
| A map or a canvas that fills the page | `FullBleed` | No padding, no footer, the shell locked to the viewport. |
| Actions belonging to a pane | `ActionBar` | The pane's last child; never an overlay. |
| Nothing to show | `EmptyState` | One sentence, **one** action. |
| Loading content of known shape | `SkeletonLoader` | The same geometry as the real thing. `Spinner` is only for "Loading more…". |
| Show a stop on an app's own ordered scale | `ScaleBadge` + `defineScale` | Priority, confidence, a level. Its own colors, never severity's; unknown is dashed. |
| Pick a stop on an app's own ordered scale | `ScalePicker` + `defineScale` | Up to nine stops plus unknown; folds to balanced rows. |
| A preview row of media, several to a page | `Carousel` | One tab stop, ← / → between tiles; tile width follows Grid density. Link "See all" to a `Grid` page. |
| View images full screen | `Lightbox` | From a `JustifiedGrid` or `Grid`. ← / →, zoom, swipe; focus returns to the thumbnail. |
| A view's hotkeys, listed | `KeyLegend` in a `Popover` | Drawn from the same binding table the handler uses (`buildHotkeyMap`); `?` opens it by convention. |
| One record per line in a narrow pane or picker | `ListRow` in a `<ul>` | Leading, title, meta, trailing; 40 / 32 dense / 44 touch. Compared in columns → `Table`; people as an index → `EntityCard`. |
| Rate something out of five | `Rating` | A radio group; whole stars; `readonly` to display. Never for severity or priority. |
| Nudge a small number | `Stepper` | − value +, ↑/↓ and PageUp/PageDown, clamped and snapped. A wide range is an `Input`. |
| A failed route | `ErrorPage` | The focused page: code, title, one sentence, Try again / Go home. Neutral copy. |
| A new version is waiting | `Banner tone="info" dismissible remember={false}` | One Reload action; dismissed for now, never forever. |
| Something the reader of this page should know | `Notice` | In the content: info, success, warning, danger; one action; dismissal remembered like a Banner's. System-wide is a `Banner`. |
| Copy a value | `CopyButton` (`inline` beside a mono value) | Says "Copied" and announces it; falls back without the Clipboard API. No toast. |
| A command, a snippet, an API response | `CodeBlock` | Mono, scrolls sideways, a copy button in its own column. No syntax colors. |
| A command on a reading page | `CodeBlock size="comfy"` | Sized to sit beside 18px `ds-reading` text; `CopyButton size="comfy"` beside a value there. |
| Compare rows by one number | `CellBar` in a `Table` cell | One scale for the column; the value stays text. |
| A few values over time | `BarSeries` | Stacked, up to six categorical series; tooltip, keyboard, a data table behind it. No axes, no zoom. |
| Parts of one whole, standing alone | `Ring` | Up to six parts, the total in the middle; on one line it is a `Meter`. |
| Pages of a list people link to | `Pager` | Newer / "1–50 of N" / Older, links driven by the URL. Lists inside an app use `LoadMore`. |
| A value from a range, by dragging | `Slider` in a `Field` | Native range input; optional value and tick labels. Precise numbers are an `Input` or `Stepper`. |
| A row of facts under a title | `FactList layout="inline"` | Label over value, wrapping. The facts of a detail pane are the grid layout. |
| A state that is neither good nor bad | `StatusBadge tone="info"` | The accent's tint: Scheduled, Read only. Not the severity scale's Info. |

## The frame

| Need | Use | Notes |
|---|---|---|
| The application frame | `AppShell` | Rail plus content column; publishes the padding, chrome-top, chrome-bottom and top-bar heights. One per app. |
| Primary navigation, desktop | `NavRail` | 56 collapsed / 208 expanded (the expanded width may be overridden), grouped, remembered per viewer; `expandAt` sets where it starts expanded. |
| A top bar's group menu with many links | `TopNav` with `NavItem.section` (and `description`) | One column per section under a heading, the rest in a footer row ("All guides"). |
| Primary navigation, phone | `TabBar` | At most five cells; the fifth opens a `Sheet` with the rest. |
| Navigation inside a section | `SideNav` | 200px beside the page. A native `<select>` on phones. `collapsible` with a group's `collapsed` to start it closed or open; an item's `description` is its tooltip. |
| A few sibling views of the same data | `Tabs` (links mode) inline in `PageHeader` | Only when all hold: about six sections at most; each is a view of the same data, not a settings page; and the pages are wide tables or grids that need the full width. Otherwise `SideNav`. |
| Something on every page of a section | `TopBar` | Search, a global create action, a scope selector or a row of chips in `start` (it scrolls when short of room). Page-specific actions go in `PageHeader` instead. |
| A page's own title and actions | `PageHeader` | Always flush; `TopBar` sits above it, outside the padded column. |
| A shell-wide control on every page's header line (global search) | `AppShell` `headerActions` | Rendered by each `PageHeader` ahead of the page's actions; an icon button and a row on phones or when the header lacks room. A page with no level-1 header shows it in the `TopBar`. |
| Page actions that must fit a busy header | `PageHeader` `actions({ compact })` | Render icon buttons when `compact`; the header asks only when it lacks room. |
| An app-level notice that must stay usable over a modal | `{@attach topmost}` | Update prompts, connectivity, a privacy screen. The `Toaster` already does it. |
| Know whether a modal is open or holds edits | `modals.open` / `modals.dirty` | Postpone a reload while the user is mid-edit; `onbeforeclose` on the Sheet keeps it open. |
| A modal of your own (a `<dialog>`, or a fixed full-screen viewer) | `trackModal(el)` while open | Counts in `modals`, and `topmost` notices move into it. A non-dialog gets no inertness: focus and Esc are its own job. |
| Phone layout or touch in script | `media.phone` / `media.coarse` | Reactive and SSR-safe. Styles use the media queries themselves. |
