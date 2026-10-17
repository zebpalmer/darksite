# Steps

Numbered steps for getting something done: "Get started" on an overview page, a setup, a how-to's
outline. An ordered list, so a screen reader hears how many steps there are and where it is.

Each step is a number in an accent tint, a title, a sentence and an optional link, one per line, with
no box around it. `variant="cards"` makes each step a tile instead: three or four across when the
list has room (from 720px of its own width), one per line below that.

## What the consumer provides

`steps` (`{ title, text?, href?, linkLabel? }[]`), `step` snippet (custom content for a step;
receives `{ step, index }`), `label` (names the list), `variant` (`list`, the default, or `cards`), `class`.

## Don't

- Don't use it for a sequence the user must complete in order inside a form — that is a wizard
  with its own state, not a list of steps.
- Don't go past five steps on an overview; link to a document page.
