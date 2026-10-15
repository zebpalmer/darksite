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

## Its height is published

Below `ds-bp-phone`, `AppShell` sets `--ds-chrome-bottom` to the bar's height plus the safe-area
inset, so pages pad their last element by it and `Toaster` lifts above it. Nothing else should
hard-code 56px.

A badge on a destination behind More shows as a dot on More, and More is marked current when the
current page is behind it.

## What the consumer provides

`items` and `groups` (the whole navigation list — the bar picks its cells, the sheet takes the
rest), `current`, `primary` (the ids of the four cells; default the first four), `moreLabel`
(default "More"), `footer` snippet (the sheet's account block), `label`. Inside `AppShell` you pass
these to the shell instead (`primaryTabs`, `account`).

## Don't

- Don't exceed five cells, and don't drop the labels to fit more.
- Don't put a destination here that is missing from the More sheet's groups — the list is one
  list.
- Don't let content scroll under it without padding by `--ds-chrome-bottom`.
