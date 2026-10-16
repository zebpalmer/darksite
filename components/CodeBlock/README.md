# CodeBlock

A block of mono text to read or copy: a command to run, a configuration snippet, an API response,
a log excerpt.

## Geometry

`ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`; 13px mono with tabular figures on 20px
lines, 10px by 12px of padding. Lines are kept whole: **a long line scrolls the block sideways**,
never wraps and never widens the page. The scroller takes focus (a ring inset by 2px) so the
keyboard can scroll it, and it is a region named by `label`, or "Code".

An inline `CopyButton` sits in its own column at the top right, so it never covers the text as the
block scrolls. `label` adds a caption above the block (12px `ds-text-3`): a file name, "Shell".

`wrap` wraps long lines instead, for output that is read more than copied.

## Color

None. There is no syntax highlighting: color in this system carries meaning, and token colors
would carry none.

## What the consumer provides

`code`, `label`, `copy` (default true), `copyLabel` (default "Copy"), `wrap`, `class`.

```svelte
<CodeBlock label="Shell" code="npm install ./package-1.2.0.tgz" />
```

## Don't

- Don't use it for an identifier inside a sentence or a table; that is mono text with an inline
  `CopyButton`, or `<code>` in `ds-prose`.
- Don't put secrets in it on a page that stays open; show a token once, then hide it.
