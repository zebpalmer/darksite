# Don't

- **Don't use opacity for text hierarchy.** Use `ds-text-1` / `-2` / `-3`. Opacity does one job:
  disabled, at 45%.
- **Don't drop below 12px, and don't use a weight above 500.** There is no bold here; a utility
  asking for one should resolve to 500. The one sub-12px text is the 11px uppercase group title,
  where capitals and tracking carry the legibility.
- **Don't flood a surface with accent or severity color.** They are for marks, borders and small
  tinted grounds.
- **Don't use emoji as icons.** Icons are Lucide, imported one at a time.
- **Don't hand-roll a dialog, popover, menu, typeahead or toast.** Use `Dialog` / `Sheet` /
  `Popover` / `Menu` / `Combobox` / `toasts`.
- **Don't size a grid from viewport breakpoints** (`lg:grid-cols-5`). Use `Grid`, which is
  container-driven.
- **Don't cap the page width.** Panes grow, grids add columns. A max width is for prose and forms
  only.
- **Don't make bulk a separate page.** Same zones, different density.
- **Don't put a modal over a work surface that could answer inline.** A `Dialog` is for a question
  the surface genuinely cannot answer.
- **Don't use imagery, gradients or illustration in the chrome.** Content thumbnails are the only
  pictures.
- **Don't let a long string set a column width.** `min-width: 0` on every grid and flex child;
  truncate single-line meta with an ellipsis plus a `title` attribute.
- **Don't fix an iOS zoom with `maximum-scale=1` or `user-scalable=no`.** That kills pinch zoom.
  The 16px touch-control rule already handles it.
- **Don't reimplement a primitive in a page.** Import it. If it nearly fits, add a prop to the
  primitive and document it — a second hand-rolled copy is the beginning of drift.
- **Don't paste a preview's markup into a screen.** The previews are the reference
  implementation, not a snippet library.
