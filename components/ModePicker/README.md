# ModePicker

The viewer's choice of mode: **System**, **Dark**, **Light**, **Paper**, **Night**, **High
contrast**. It drives the `mode` store, which applies the choice to the whole page
(`data-ds-theme` on `<html>`, removed for System) and remembers it in this browser.

```svelte
<script>
  import { ModePicker, mode } from 'darksite';
  mode.init();                                   // once, in the root layout
  mode.subscribe((m) => saveToAccount(m));       // optional: keep it per account too
</script>

<ModePicker />
```

A native select by default, which fits a rail's footer, a TabBar's More sheet or a settings page;
`variant="segmented"` shows the choices side by side for a settings page with room. Where there is
less room than six segments need (a 320px phone column, a flex row, a grid cell), it shrinks to its
container and scrolls sideways, the current mode in view.

To avoid a flash of the wrong mode on load, put `MODE_SCRIPT` — exported by darksite — in a
`<script>` in `app.html`'s `<head>`: it applies the saved mode before the first paint.

## What the consumer provides

`modes` (which to offer and in what order; default all six — a product without long-form reading can
leave out the reading modes), `label` (default "Theme"), `hideLabel`, `variant` (`select` |
`segmented`), `store` (default the app's `mode`), `class`. The words come from `strings`.

## Don't

- Don't offer a mode the product has not been looked at in. All six work everywhere, but check a new
  screen in paper and night as well as dark and light.
- Don't set the mode from more than one place; the store is the one source.
