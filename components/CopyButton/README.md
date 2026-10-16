# CopyButton

Copies a string — a link, an identifier, a command, a token shown once — and says so. The label
turns to **Copied** with a check for two seconds, and a polite live region announces it, so a
screen reader hears the result while focus stays on the button.

## Forms

- **Button** (the default): a `Button` with a 16px copy icon and its label, "Copy" or a more
  specific "Copy link". `variant` is `secondary` (default) or `ghost`; `size` as `Button`.
- **`inline`**: a 24px icon button that sits **beside a mono value** — an identifier in a
  `FactList`, a hash in a table cell, a key in a settings page. Ghost, `ds-text-3` at rest,
  `ds-text-1` on a `ds-bg-4` hover, `ds-success-text` while it says Copied. `label` is its accessible
  name and its tooltip, so name what it copies: "Copy identifier". On touch its hit area grows to
  44px without moving the value beside it.

## Without the Clipboard API

The Clipboard API needs a secure origin and, in some browsers, a permission. Without it — or when
it refuses — CopyButton selects the text in a hidden field and copies that. If both fail it says
**Copy failed** the same way, in `ds-danger-text` inline, and never throws. `oncopy(ok)` reports
which.

## What the consumer provides

`value` (a string, or a function returning one, read at the moment of copying), `label` (default
"Copy"), `copiedLabel` (default "Copied"), `inline`, `variant`, `size`, `resetAfter` (ms, default
2000), `oncopy(ok)`, `disabled`, `class`.

```svelte
<span class="mono">R-00412</span>
<CopyButton value="R-00412" inline label="Copy identifier" />

<CopyButton value={shareUrl} label="Copy link" />
```

## Don't

- Don't follow a copy with a toast; the button already says Copied, where the eye is.
- Don't put a copy button beside every value in a table; copy the row's identifier, or offer it in
  the row's `Menu`.
- Don't use an inline CopyButton without a `label` that names the value.
