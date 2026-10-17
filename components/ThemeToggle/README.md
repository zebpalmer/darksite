# ThemeToggle

One button that flips between two modes — **dark** and **light** by default. It shows a moon while
a dark mode is on and a sun while a light one is, and a press switches to the other mode through the
`mode` store, which applies it to the page and remembers it in this browser.

```svelte
<script>
  import { ThemeToggle, mode } from 'darksite';
  mode.init({ fallback: 'dark' });   // once, in the root layout: dark until the viewer chooses
</script>

<ThemeToggle />
```

- **It names the action.** Its label says what a press does — "Switch to light mode", "Switch to
  dark mode" — and it is not a pressed toggle (`aria-pressed` would claim one of the two is "on").
  The label is the icon button's tooltip too.
- **System.** While the store follows the device (`system`, the default until the viewer chooses),
  the device's preference decides which mode counts as on, so the icon and the next mode are right
  from the first press. The server renders it as dark; the device's answer applies on mount.
- **Other modes.** From a mode that is not one of its two (paper, say), a press goes to the one of
  the other kind: from a light mode to the dark one, from a dark mode to the light one.
- **A default mode.** `mode.init({ fallback })` sets the mode used while nothing is saved, and
  `modeScript(fallback)` returns the script that applies the same before the first paint. Put what
  `modeScript('dark')` returns (the same fallback as `init`) in a `<script>` in `app.html`'s
  `<head>` — copied in, or injected with SvelteKit's `transformPageChunk`:

  ```ts
  // hooks.server.ts, with <script>%mode-script%</script> in app.html's <head>
  import { modeScript } from 'darksite';
  const script = modeScript('dark');
  export const handle = ({ event, resolve }) =>
    resolve(event, { transformPageChunk: ({ html }) => html.replace('%mode-script%', script) });
  ```

  `MODE_SCRIPT` is `modeScript()`, which follows the device while nothing is saved.

## What the consumer provides

`modes` (the two, in order; default `['dark', 'light']`), `store` (default the app's `mode`),
`label` (a string, or a function of the mode a press switches to; default from `strings.switchToMode`),
`showLabel` (visible text beside the icon, such as "Appearance": the button then reads that text and
then the action, for a phone sheet's footer or a settings row), `size`, `class`.

## Don't

- Don't use it where the product offers more than two modes; that is `ModePicker`.
- Don't put a toggle and a `ModePicker` on the same screen. One control per choice.
- Don't word the label as a state ("Dark mode") — it names what a press does.
