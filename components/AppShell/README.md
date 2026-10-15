# AppShell

The application frame: a `NavRail` beside a content column that holds an optional `TopBar`, the
page, and whatever bottom chrome the page needs. Below `ds-bp-phone` the rail is replaced by a
`TabBar` and the column becomes the whole screen.

It is the one component allowed to ask about the viewport ([`layout.md`](../../docs/layout.md), "Breakpoints").

## What it owns

- **The grid:** `grid-template-columns: auto 1fr`, the rail sized by `ds-rail-w` or
  `ds-rail-w-expanded`, the column taking the rest. No maximum width.
- **The padding contract:** the padded column publishes `--ds-pad-top` and `--ds-pad-x` so
  `PageHeader` can cancel them and sit flush. A page that lays out its own panes sets both to
  `0px`.
- **`--ds-chrome-bottom`:** the height of fixed bottom chrome — the tab bar plus its safe-area
  inset on phones, `0px` on desktop. Pages pad by it; `Toaster` lifts above it.
- **`--ds-topbar-h`:** the top bar's height (the `TopBar` publishes it), for panes sizing
  themselves against it.
- **The work-view switch:** while the page renders a `WorkView`, the column's padding is zero and,
  from 768px, the shell locks to the viewport so the WorkView fills what the `Banner` and `TopBar`
  leave. No `padded={false}` and no height arithmetic in the page.
- **One `Toaster`**, mounted here and nowhere else.
- **A "Skip to content" link**, the first thing a keyboard reaches, onto the page's `<main>`.

## What the consumer provides

```svelte
<AppShell {items} {groups} {current} product="Acme" {mark} {account} rememberAs="main">
  {#snippet topBar()}<TopBar {search} />{/snippet}
  {@render children()}
</AppShell>
```

`items` and `groups` (the single navigation list — see [`shell.md`](../../docs/shell.md)),
`current` (the active id), `product` and `mark` (the brand), `account` snippet (the rail's footer
and the More sheet's; receives `{ compact }`), `version`, `rememberAs` (remember the rail's state
for this viewer), `primaryTabs` (the tab bar's four ids), `banner` and `topBar` snippets,
`children` (the page), `padded` (default true; false hands the whole column to a work view),
`toaster` (default true), `railExpanded` (bindable), and the rail's slots — `railSearch`,
`railStatus`, `railBadge` and `railPinned`, passed to `NavRail` as `search`, `status`, `badge` and
`pinned`.

## Header actions

`headerActions` is a snippet of shell-wide controls — usually a global search — that sits on the
same line as every page's header, right-aligned, instead of in a strip of its own. The shell hands
it to `PageHeader` through context, and each level-1 `PageHeader` renders it **ahead of the page's
own `actions`**, so the page's primary button stays right-most. Pages change nothing.

```svelte
<AppShell {items} {current} {headerActions}>
  {@render children()}
</AppShell>

{#snippet headerActions()}
  <form role="search" onsubmit={search}>
    <input class="ds-control" type="search" aria-label="Search" aria-keyshortcuts="/" />
  </form>
{/snippet}
```

- **It lives in the header.** A page with no `PageHeader` shows no header actions; a page that
  wants none passes `shellActions={false}` to its `PageHeader`. A level-2 header never shows them.
- **`/` focuses its first field** (the `focusShortcut` attachment, as in `TopBar`): not while the
  user is typing, and not when the page already took the key. `headerActionsKey` picks another key;
  `null` hands it to the page.
- **On phones** it collapses to an icon button — `headerActionsIcon` (default a search icon) named
  by `headerActionsLabel` (default "Search") — with `aria-expanded`. It opens a full-width row
  under the header, inside it so a sticky header keeps it, and moves focus to the row's first
  field; the shortcut key opens it the same way; the first element in the row grows to its width. Esc from inside the row (unless a control
  in it already handled Esc) closes it and returns focus to the button, and so does a navigation:
  a change of `current`, or a new page.

Pick one home for a shell-wide search: `headerActions`, a `TopBar` or the rail's `railSearch`.

## Don't

- Don't give the column a maximum width. Panes grow and grids add columns.
- Don't mount a second `Toaster`, or a second navigation list.
- Don't let a page reach past the shell to position itself against the viewport.
