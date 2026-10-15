# Lightbox

The full-screen **image viewer**: one image at a time, fitted to the screen, stepped with the
arrow keys, zoomed and panned. Open it from a `JustifiedGrid` or a `Grid` of thumbnails.

Built on the native modal `<dialog>`, filling the viewport: focus is trapped, **Esc closes**, the
page behind cannot scroll, and focus **returns to the trigger** (or `finalFocus`). The content
mounts only while open. The dialog takes focus itself on open, so the arrow keys work at once.

## Layout

- **Top bar** (`ds-bg-1`, 48px): the counter ("3 of 12", `ds-text-2`, tabular), the `actions`
  snippet, zoom out / zoom in, and Close.
- **Stage** (`ds-bg-0`): the image, fitted inside the stage and never upscaled past its natural
  size, with round previous / next buttons on its edges. A spinner shows until the image loads; a
  broken image shows "Image unavailable" with an icon.
- **Caption bar** (`ds-bg-1`, only with a `caption` snippet): `ds-text-2` at 13px.

On phones it fills the screen edge to edge; the bars are padded by the safe-area insets, so
nothing sits under a notch or the home indicator. **The only picture is the content** — the chrome
is plain grounds, borders and icons.

## Navigation

- **← / →**, the side buttons, or a horizontal **swipe** on touch step through `items`; **Home /
  End** jump to the ends. At an end the step stops and its button is hidden, unless `loop`.
- The next two images and the previous one are preloaded.
- `index` is bindable: the page always knows which image is showing.
- The counter is an `aria-live="polite"` region, so each step is announced. Every item needs a
  real `alt`.

## Zoom and pan

On by default; `zoom={false}` turns it off. Up to `maxZoom` (default 4×).

- **Double-click** (mouse) or **double-tap** (touch) toggles 2× at the point, and back to fit.
- **+ / −** step by 1.5×, **0** fits again. The zoom buttons do the same.
- **Pinch** on touch, and a **trackpad pinch** (ctrl + wheel) on desktop, zoom about the fingers.
- **Drag** pans while zoomed, clamped so the image never leaves the stage; a plain wheel pans too.
- Stepping to another image resets to fit.

A swipe down on touch closes the viewer. While a finger drags, the image follows it, except under
`prefers-reduced-motion`, where the image only changes at the end of the swipe. Every transition is
zeroed under reduced motion.

## Keys

| Key | Does |
|---|---|
| ← / → | Previous / next image |
| Home / End | First / last image |
| + / − | Zoom in / out |
| 0 | Fit to screen |
| Esc | Close |

Each button carries its key in `aria-keyshortcuts` and in its tooltip. Keys stand aside while focus
is in a text field in the `actions` toolbar.

## What the consumer provides

`items` — `{ src, alt, width?, height? }` (`width` and `height` reserve the box before the image
loads) — `open` (bindable), `index` (bindable), `label` (the dialog's accessible name, default
"Image viewer"), `loop`, `zoom`, `maxZoom`, `onclose()`, `finalFocus`, `caption` snippet and
`actions` snippet (icon buttons for the toolbar) — both receive `(item, index)` — `class`.

## Don't

- Don't put a form in the viewer. Edit on the detail page, or in a `Sheet`.
- Don't decorate the chrome. The image is the only picture.
- Don't autoplay through the images.
- Don't use it for a single small image that already fits inline.
