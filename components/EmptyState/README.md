# EmptyState

"Nothing here" with a way forward: a solid `ds-border` edge at `ds-radius-md` — never dashed, because dashed means "not confirmed" —, a 24px
`ds-text-3` icon, a 16/500 title, **one sentence**, and **one** action.

## What the consumer provides

`title`, `message` (one sentence, capped at 60ch), `icon` (a Lucide component; an inbox icon by
default), `action` snippet (**a single Button**), `align` (`start` by default; `center` for a lone
full-page state), `class`.

## Don't

- Don't offer two actions. If there are two ways forward, the page is making the user choose
  before it has told them anything.
- Don't write a paragraph. One sentence.
- Don't use an illustration — the icon is the whole picture.
