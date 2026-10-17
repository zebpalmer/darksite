# TopNav

Primary navigation as a bar across the top, for a product with a few top-level sections. Use it
through `AppShell nav="top"`, which renders it; on its own it is the same component.

It reads the **same navigation list** as the rail ([`shell.md`](../../docs/shell.md)):

- **Items without a group** are links in the bar.
- **Each group** is a menu: a button ("Records ▾") that opens a list of links. It stands where the
  group's first item stands in the list, so the bar keeps the list's order — menus and links mixed
  as the list has them. The phone sheet keeps the same order. It follows the
  disclosure-navigation pattern — `aria-expanded` on the button, real links in the list, so a link
  opens in a new tab like any other. Focus moves into the list when it opens; Esc or a press outside
  closes it and returns focus to the button.
- **Descriptions.** An item's `description` is a second line under its label in the menu, in
  `ds-text-3` at 13px; the link's name stays its label, and the description is read as its
  description. A menu with descriptions is a little wider (up to 400px).
- **Sections.** Give a group's items a `section` and its menu lays out one column per section, in
  the order the sections first appear, each under an 11px uppercase heading — up to three across,
  as wide as the viewport allows (less 16px); a fourth section starts a new row. The group's items
  with no section form a row under the columns, past a hairline: the place for "All guides".

  ```ts
  { id: 'start', label: 'Getting started', href: '/guides/start', group: 'guides', section: 'Learn',
    description: 'The first ten minutes.' },
  { id: 'api', label: 'API', href: '/guides/api', group: 'guides', section: 'Reference' },
  { id: 'all', label: 'All guides', href: '/guides', group: 'guides' }
  ```

  The keys do not change: it is still one disclosure of links, Tab moving through them in order.
- **The current page** is `aria-current="page"`; its link or its group's button carries a 2px accent
  mark along the bar's foot.
- **On phones** the links go: the bar keeps the product and a menu button that opens a `Sheet` with
  every destination, grouped, and the account block. A sectioned group shows its section headings
  as smaller sub-headings under the group's title, its unsectioned items last; descriptions are
  left out.
- **The shell's search.** Inside an `AppShell` with no `topBar`, on a page with no level-1
  `PageHeader`, the bar holds the shell's `headerActions` ahead of its own actions. On a phone they
  collapse to an icon button beside the menu button that opens a full-width row under the bar —
  inside it, so the sticky bar keeps it. Put a search there, not in `actions`, which stay inline at
  every width.
- **Content width.** With `AppShell contentWidth`, the bar's contents keep to the page's width, so
  the product name lines up with the page titles and the content.

The bar is 56px on the chrome's bar roles (`ds-bar-*`), so a brand can give it its own color and
everything in it follows. Sticky by default.

## What the consumer provides

`items`, `groups`, `current`, `product`, `mark`, `homeHref` (where the product links, default `/`),
`actions` snippet (the right end: a search trigger — see `SearchPalette` — a `ThemeToggle`, a
sign-in), `accountInline` snippet (the account block in
the bar on desktop), `account` snippet (the phone sheet's footer), `label` (default "Primary"),
`sticky` (default true), `class`. Inside `AppShell` these come from its own props.

## Don't

- Don't use it for more than about seven top-level entries — that is a rail.
- Don't nest a menu in a menu. Two levels: the bar, and a group's links. Sections are headings
  inside one menu, not menus of their own.
- Don't give one group more than about three sections, or a section more than about six links; that
  much navigation is a page of its own (link it from the footer row).
- Don't write descriptions as marketing. One short sentence about what is there.
- Don't put actions (buttons that do something) in a group's menu; it is navigation. Actions go in
  `actions`.
