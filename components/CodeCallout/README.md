# CodeCallout

A short code shown large, to be **written down, read aloud or typed on another device**: the code
just issued for a part's label, a pairing code, a pickup or locker number, a one-time code shown to
an operator. Above the code, the instruction as a label ("Write on the label"); under it, one meta
line ("Issued 09:12").

## Geometry

`ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`, 14px by 18px padding. The code is
`mono` at **48px / 56px, weight 500**, `ds-text-heading`, with tabular figures, the font's slashed zero
where it has one (Geist Mono does) and 0.06em tracking, so each character keeps its width and `0`
reads apart from `O`. A product that issues codes should still leave the ambiguous glyphs out of its
alphabet. Under
240px of its own width (a container query) the code drops to 36px. A code that still does not fit
wraps rather than widening the page.

This is the one place darksite sets text above 32px outside an article title. A code that someone
copies by hand at arm's length, in poor light or at an angle, needs the size; nothing else does.
The weight ceiling still holds.

`accent` adds a 3px `ds-accent` stripe on the leading edge, the way a `Stat` shows a level: use it
for the code that was **just issued**, beside older ones that were not.

## Accessibility

The callout is a `group` named by its `label` (or "Code" without one). The code itself is hidden
from screen readers and spoken one character at a time instead — "R 4 1 2" — so it is never read as
a word or a number. `copy` adds an inline `CopyButton` ("Copy code") with its own live
announcement.

## What the consumer provides

`code`, `label`, `meta`, `copy`, `copyLabel` (default "Copy code", from `strings`), `accent`,
`class`.

```svelte
<CodeCallout code={issued} label="Write on the label" meta="Issued {time}" accent />
<CodeCallout code={pairing} label="Enter on the new device" meta="Expires in 10 minutes" copy />
```

## Don't

- Don't use it for a value that is only read on screen — an identifier in a record is mono text in
  a `FactList` or a table cell, with an inline `CopyButton`.
- Don't use it for a number that is a measure; a headline figure is a `Stat`.
- Don't put more than one code in a callout, or more than a line of meta under it.
- Don't make it a link or a button; an action on the code sits beside the callout.
