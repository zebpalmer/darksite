# TabBar

Primary navigation below `ds-bp-phone`, replacing `NavRail`. Fixed to the bottom, `ds-tabbar-h`
(56px) plus the bottom safe-area inset, on `ds-bg-2` with a hairline top border.

## Five cells, hard ceiling

Four destinations and a **More** cell. Five is not a style preference: below about 64px a cell
cannot hold a legible label, and an unlabeled tab bar is a guessing game.

**More** opens a `Sheet` holding every remaining destination under the same group headings the
rail uses, plus the account block. Same list, same groups, different presentation.

Each cell is an icon over a 12px label, both `ds-text-3`, turning `ds-text-1` with an
`ds-accent` icon when current. There is no underline and no pill — the color change and the
icon's weight are the whole signal at this size.

## It publishes its own height

While mounted it sets `--ds-chrome-bottom` to its height plus the safe-area inset, so pages pad
their last element by it and `Toaster` lifts above it. Nothing else should hard-code 56px.

## What the consumer provides

`items` (the first four, from the one navigation list), `current`, `badge(item)` (a dot, or a
count for small numbers), `moreGroups` (everything else, grouped), `footer` snippet for the
sheet's account block.

## Don't

- Don't exceed five cells, and don't drop the labels to fit more.
- Don't put a destination here that is missing from the More sheet's groups — the list is one
  list.
- Don't let content scroll under it without padding by `--ds-chrome-bottom`.
