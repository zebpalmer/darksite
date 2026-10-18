# Layout

Six page types, one scroll rule, and a short list of breakpoints. Most layout bugs in a
dense tool come from a page inventing its own answer to one of these.

## Page types

**1. Content page.** The shell's column supplies the padding (16px on phones, 20px top / 24px
sides from `ds-bp-phone`) and **the document scrolls**. `PageHeader` first, then the content. This
is the default: settings, detail pages, lists, anything that is just a page.

**2. Work view.** The page lays out its own panes, opts out of the column's padding and **owns its
own scrolling** — the document does not scroll at all on desktop. A queue beside a card, a filter
rail beside a grid, anything with an `ActionBar` pinned to the bottom of a pane. This is the
archetype a dense tool is actually built from.

**3. Focused page.** One centered column, capped at a readable width, vertically centered when it is
short: sign-in, a setup gate, a fatal error. No rail, no header, no actions bar — just the one
thing being asked.

**4. Overview page.** Where a product or a section starts: what it is, how to begin, where to go.
An `Intro` (a title, a sentence or two, up to two actions) instead of a PageHeader, then `Steps`
for getting started and `LinkCard`s in a `Grid` for the destinations — and a `StatRow` if there are
numbers worth seeing first. This is the only page that opens with an intro block; a work or list
page never does, because it pushes the work below the fold.

**5. Document page.** Help, a how-to, a method note: prose. `PageHeader`, then an `<article
class="ds-prose">` — headings, paragraphs, lists and inline code at a readable measure. Long-form
reading (a story, a report) uses `ds-reading` instead, with the paper or night mode. Under a
top bar (`nav="top"`) the article is centered in the column; beside a rail it starts at the
column's edge. `AppShell proseAlign` sets either for the whole product. Sentences are the content
here; the "labels, not sentences" rule is about controls and work surfaces.

A post on a public site — a blog or news article, a write-up — uses `<article class="ds-article">`
instead: the interface font at 18px in a 720px text column, inside a 1120px wide column. The
article's own `<header>` takes the place of the PageHeader, all in the text column on the body's
left edge: an optional `ds-article-kicker` (a section or a category, 13px at 500 in `ds-accent-text`;
add `ds-article-kicker-caps` for 12px small capitals, set `--ds-article-kicker-color` to
`var(--ds-text-2)` to mute it), the `h1` title, a `<p class="ds-article-summary">` of a sentence or
two, and a `<p class="ds-article-meta">` line (the author, the date, the reading time). The meta draws
its own "·" separators: write each item as one element (a `<span>`, a `<time>`; a link goes inside
its item) and no separators. An item stays whole, and a line breaks before a separator, never
between it and its item, so no line starts or ends with one.

The title is fluid in the article's width: 32px up to a 560px article, growing to 52px at 1110px,
and `ds-text-2xl` when the article is narrower than 520px. It is the one text in the system above
32px. `--ds-article-title-size` replaces the wide size. When the header opens the article it has
space above it, 24px growing to 48px with the article's width; `--ds-article-header-space` replaces
it.

A figure, a table or a code block marked `ds-article-wide` breaks out to the wide column; a
component goes in a `<div>` or `<figure>` that carries the class. A component placed directly in the
article — a `CodeBlock`, a `Notice` — takes the article's rhythm like any block. The article always
centers itself, whatever `proseAlign` says, and both columns shrink to what the column has: under a
1060px `contentWidth` the wide column is 1060px, and on a phone both are the padded column.

```svelte
<article class="ds-article">
  <header>
    <p class="ds-article-kicker"><a href="/guides">Guides</a></p>
    <h1>Title</h1>
    <p class="ds-article-summary">A sentence or two.</p>
    <p class="ds-article-meta">
      <span>By A. Rivera</span>
      <time datetime="2026-10-04">October 4, 2026</time>
      <span>6 min read</span>
    </p>
  </header>
  <p>Body…</p>
  <CodeBlock size="comfy" label="Shell" code="tool run" />
  <figure class="ds-article-wide"><img src="…" alt="…" /><figcaption>…</figcaption></figure>
</article>
```

**Ghost content.** A post from the Ghost CMS opts in with `class="ds-article ds-article-ghost"`, its
HTML placed directly in the article after the header (`{@html post.html}`), so each card is a child
of the article's grid. The class maps the card markup Ghost's editor (Koenig) writes for the web, its
`kg-*` classes, onto darksite's roles; the rules match only inside `ds-article-ghost`. Under it the
article spans the page column, and its wide column stays centered at 1120px: `kg-width-wide` takes
the wide column, `kg-width-full` the whole page column, with a caption or a band's text kept to the
text column. Captions are Ghost's bare `<figcaption>`s; paragraphs, headings, lists, quotes, code
blocks and the divider (`<hr>`) are bare elements the article already styles.

- **Image** (`kg-image-card`): in the text column, or wide or full.
- **Gallery** (`kg-gallery-card`): justified rows, each image whole at its own aspect ratio; without
  the script, equal shares cropped to the row's tallest image.
- **Bookmark** (`kg-bookmark-card`) and **file** (`kg-file-card`): bordered rows, a bookmark's
  thumbnail beside its text (above it in a narrow article), a file's name and size beside a download
  icon.
- **Callout** (`kg-callout-card`) and **call to action** (`kg-cta-card`): Ghost's colors map to the
  tints (blue the accent tint, green, yellow and red the success, warning and danger tints, pink and
  purple the second color's, gray the raised ground, white and none open). A call to action is a row
  (`kg-cta-minimal`) or stacked (`kg-cta-immersive`), with its sponsor label, image and button.
- **Button** (`kg-button-card`) and the buttons in the other cards: Button's look at the comfy size,
  primary for Ghost's accent and secondary otherwise, 44px under a coarse pointer.
- **Header** (`kg-header-card`, both versions) and **signup** (`kg-signup-card`): a band. Its ground
  follows Ghost's style: dark the deepest ground, light the raised one, accent the accent tint, an
  image under the media scrim with its text in `ds-on-media`. v1's sizes set its space; v2 and signup
  take Ghost's widths and the split layout (an image beside the text, after it when swapped, above it
  in a narrow article). The signup form's states are classes the site's script sets on the form:
  `loading`, `success` (the message replaces the field) and `error` (the field marked, the message
  shown). Ghost renders the signup card hidden (`style="display: none"`) for its own script to show
  and submit; a site that wires the form itself shows it. darksite only styles it.
- **Product** (`kg-product-card`): a bordered card at most 560px wide: image, title, star rating,
  description and a full-width button.
- **Toggle** (`kg-toggle-card`): a bordered box whose heading opens its content.
- **Audio and video** (`kg-audio-card`, `kg-video-card`): the browser's own controls; Ghost's player,
  which needs Ghost's script, is always hidden.
- **Embed** (`kg-embed-card`) and **Transistor** (`kg-transistor-card`): a player fills the text
  column at its own aspect ratio (16:9 without the script); one sized in percent keeps its height.
- **Alternate quote** (`kg-blockquote-alt`): large and centered. **Code card** (`kg-code-card`): the
  code block with a caption.

Ghost's own card script (`cards.min.js`) is not loaded on a headless site, so the cards' behavior
comes from one opt-in attachment, `ghostCards`:

```svelte
<script>
  import { ghostCards } from 'darksite';
</script>

<article class="ds-article ds-article-ghost" {@attach ghostCards}>
  <header>…</header>
  {@html post.html}
</article>
```

It makes each toggle's heading a disclosure button (`aria-expanded`, `aria-controls`, Enter and
Space) that opens and closes the card through Ghost's `data-kg-toggle-state`; turns on the native
controls of audio and video; sets each gallery image's share of its row and each embed's aspect
ratio from their width and height; names a product rating as one image ("4 of 5 stars", from
`strings.stars`); and drops the colors Ghost's editor writes inline on header (v2), signup and
call-to-action cards, so they take darksite's roles in every mode, keeping a card's dark or light
background as its tone. `ghostCards({ authorColors: true })` keeps the editor's colors instead. It
watches the article, so content replaced later is enhanced too, undoes everything when it is
removed, and does nothing on the server. Without it the content still reads: a toggle stays open,
since base.css hides closed content only on a toggle the attachment has enhanced.

Not covered: the paywall, email and email call-to-action cards, NFT cards, and raw HTML and Markdown
cards, whose markup is the author's own.

**6. Full-bleed page.** A map, a canvas, a diagram that takes the whole column: `FullBleed`. No
padding and no footer, the shell locked to the viewport at every width, so it fills exactly what
the navigation leaves; panels float over it with absolute positioning.

## Scroll ownership

**Exactly one element owns a scroll.** Decide which, per archetype, and make every ancestor
non-scrolling.

A pane that scrolls is always this shape:

```css
.pane   { display: flex; flex-direction: column; min-height: 0 }
.body   { flex: 1; min-height: 0; overflow: auto }   /* min-height: 0 is not optional */
.footer { flex: none }                                /* ActionBar */
```

`min-height: 0` on the scrolling child is the single most-forgotten line in flex layout: without
it the child refuses to shrink below its content, the pane grows instead, and the scroll silently
moves to the document.

On desktop a **work view locks the document** so its panes can be sized by the frame instead of
fighting the page. On phones it does not — there, let the document scroll and let the panes stack.

**Build a work view with `WorkView`**, which does all of this: inside `AppShell` it locks the shell
to the viewport from 768px, zeroes the column's padding, and fills what the `Banner` and `TopBar`
leave, with the `PageHeader` on top, a rail beside the results, the results as the one scroller
and the `ActionBar` under them. A page should never compute its pane heights from `--ds-topbar-h`
or cancel padding with negative margins:

```svelte
<WorkView label="Records">
  {#snippet header()}<PageHeader title="Records" count={total} />{/snippet}
  {#snippet rail()}<FilterRail {sections} bind:value />{/snippet}
  {#snippet top()}<ActiveFilters {sections} bind:value />{/snippet}
  <Table {rows} {columns} rowKey={(r) => r.id} label="Records" />
  {#snippet footer()}<ActionBar>…</ActionBar>{/snippet}
</WorkView>
```

A work view with a different shape (a queue beside a card) uses the pane pattern above inside the
WorkView's body.

## Panes and sidebars

**A sidebar needs a job.** A filter panel, a work queue, a secondary nav. Everything else is full
width. A sidebar that exists to balance the page is decoration, and this system has none.

- **Filter or queue rail:** 240–280px, its own scroll, collapsible, and it must collapse rather
  than shrink — a 140px filter panel is worse than none.
- **Secondary nav:** 200px, sticky, its own scroll (`SideNav`).
- Below `ds-bp-phone` every sidebar becomes a `Sheet`. No exceptions — a 320px phone cannot show
  two columns of anything useful.

## Width

**In a tool, nothing caps the page width.** Panes grow, grids add columns, tables get more room.
The two exceptions are **prose** and **forms**, which cap around 60–70 characters and 520px
respectively, because a 2000px-wide input is unusable.

**A site under a top bar caps its content.** A public or reference site (`nav="top"`, pages of
prose, figures and short lists) reads better on a centered grid than stretched across a wide
screen: `AppShell contentWidth` (`true` for 1060px) caps the column and keeps the TopNav, TopBar
and footer contents to the same width, so the product name, the page titles and the content share
edges. A map or a work view still takes the whole column, and a page that holds a wide table marks
an element `ds-wide` to use `--ds-content-wide` instead (no cap unless the product sets one).

This is why `Grid` is container-driven: a grid beside an open filter rail should show fewer
columns than the same grid with the rail closed, and no viewport breakpoint can know that.

## Breakpoints

Four, and they are tokens: `ds-bp-compact` 520 · `ds-bp-phone` 768 · `ds-bp-wide` 1200 ·
`ds-bp-rail` 1440.

**The rule that matters: components use container queries, only the shell uses viewport
breakpoints.** A component does not know how wide the viewport is and should not care — it knows
how much room *it* was given. `SeverityPicker` folds its rows on its own width;
`Grid` chooses columns on its own width. The shell is the one thing entitled to ask about the
viewport, because it is the thing laying out the viewport.

The exception is **touch**, which is a capability and not a width: `(pointer: coarse)` is what
raises every control to 44px, independently of `ds-bp-phone`. A tablet gets touch sizing at
desktop widths, which is correct.

## Long lists

**Tables and lists load a page and offer "Load more"** — no page numbers, no "1–50 of 295" footer.
The exception is a list whose pages must each have a URL — a public listing, search results, an
archive that people link to and search engines read: that list ends in a `Pager` (Newer, "1–50 of
295", Older, each a link), and nothing else about it changes.

- The list's foot is `LoadMore`: a full-width secondary `Button` reading "Load more", beside a
  `meta` line ("Showing 50 of 295"). While it loads, the button takes its loading state ("Loading more").
- New rows **append**. They never steal focus: keyboard focus stays on whatever row had it. When the
  button itself was activated from the keyboard, focus moves to the first new row, so the next
  arrow key continues into the new rows.
- **Infinite scroll is for image grids only** (`JustifiedGrid`), where a sentinel loads the next
  page as you approach the end. On a table it would make the foot of the page unreachable.
- **Selecting across unloaded rows is a second step.** The header checkbox selects the *loaded*
  rows; the `ActionBar` then offers "Select all 295". Choosing it switches the selection from a list
  of keys to "everything matching the current filter", which the consumer must handle as its own
  mode. Changing the filter or sort clears it.
- Changing the sort or a filter returns to the first page.

## The padding contract

The shell's padded column publishes its own padding as `--ds-pad-top` and `--ds-pad-x`.
`PageHeader` cancels it with negative margins so it stays flush to the column edges, and anything
else that must bleed full-width does the same. A page that lays out its own panes sets both to
`0px` and takes over.

This is one variable pair rather than a prop drilled through every page, so a page added later
inherits the right geometry by default instead of by remembering to.
