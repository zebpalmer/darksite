# Spinner

The loader-circle icon, spinning for 0.9s linear — static under `prefers-reduced-motion`, like
every other motion in the system.

Use it for **"Loading more…"** and inside a `Button loading`. For content whose shape you already
know, use `SkeletonLoader` instead: a placeholder with the real geometry tells the user more than
a spinner does.

## What the consumer provides

`size` (px, default 16; a Button passes 16, or 18 at touch size), `label` (screen-reader text,
which also makes it a `role="status"` — omit it when a visible "-ing" verb sits beside it),
`class`.

## Don't

- Don't spin a whole page. That is a skeleton.
- Don't pass `label` when the button already says "Saving".
