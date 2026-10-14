# NewBadge

The compact `new` pill: an accent outline at `ds-radius-xs`, `ds-accent-text`, 16px tall, one
word.

It means the value is not a label (or a person) anywhere yet — **by name, alias or spelling
variant**, all checked first — so clicking the chip it sits in creates it and applies it. Quiet on
purpose: no sentence, no color fill, nothing that competes with the value's own name.

Used inside a suggestion `Chip` (`isNew`, which also tints the chip's dashed border with the
accent), and anywhere else a value is offered before it exists.

## What the consumer provides

`class`. That is all — it carries no state.

## Don't

- Don't use it for "recently added". It means "does not exist yet".
- Don't pair it with an explanatory sentence.
