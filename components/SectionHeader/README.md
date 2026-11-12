# SectionHeader

The heading of a section within a page: a title, a count and optional actions on the right. It is
what sits above a list or table inside a page, where `PageHeader` sits above the page.

It follows the page header's rhythm: the heading font at weight 500 (`text-lg` for level 2,
`text-md` for level 3), the count in the same muted `text-sm` as the page header's, a 12px gap
between them, 32px tall, and 12px below it before the section's content. The count is mono with
tabular figures, so a column of sections lines up.

## Count

`count` is a number, localized. Undefined (or null) hides it; `0` shows. `tone` colors it:
`neutral` (default, `ds-text-3`), `warning` or `danger` (the state roles' text, checked in every
mode). Use a tone for a count that asks for attention, such as the number of items that need action,
never as decoration. The count is part of the heading's accessible name.

## Level

`level` is `2` (default) or `3`. A page's one `h1` is the `PageHeader`; a section inside a section is
level 3. `id` goes on the heading, for the section's `aria-labelledby`.

## Actions

An `actions` snippet, right-aligned on the heading's line; it wraps under the heading when there is
no room (the container's own width, not the viewport's).

## What the consumer provides

`title`, `count?`, `level?`, `tone?`, `actions?`, `id?`, `class?`.

## Don't

- Don't use it as the top of the page: that is `PageHeader`.
- Don't put a sentence of explanation under it; use a `HelpTip` or nothing.
- Don't make a block that folds away from it: that is `Pane collapsible`.
