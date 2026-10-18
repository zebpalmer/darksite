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

## On a reading page

`size="comfy"` sits beside 18px long-form text (`ds-reading`, `ds-article`): 16px mono on 26px
lines, 14px by 16px of padding, a 13px caption, and a comfy inline `CopyButton` (32px, an 18px
icon) whose center stays on the first line's. The default size suits the 14px of an operator screen and `ds-prose`.

Placed directly in a `ds-article`, it takes the article's rhythm: its own margin reset sits in the
`ds.base` layer at zero specificity, so it clears only the browser's figure margin, and the page's
rules set the space around it. No wrapper is needed.

## Color

None. There is no syntax highlighting: color in this system carries meaning, and token colors
would carry none.

## What the consumer provides

`code`, `label`, `copy` (default true), `copyLabel` (default "Copy"), `wrap`, `size` (`default` |
`comfy`), `class`.

```svelte
<CodeBlock label="Shell" code="npm install ./package-1.2.0.tgz" />

<article class="ds-reading">
  <p>Install the package first.</p>
  <CodeBlock size="comfy" label="Shell" code="npm install ./package-1.2.0.tgz" />
</article>
```

## Don't

- Don't use it for an identifier inside a sentence or a table; that is mono text with an inline
  `CopyButton`, or `<code>` in `ds-prose`.
- Don't put secrets in it on a page that stays open; show a token once, then hide it.
