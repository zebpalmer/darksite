# FileInput

Choose one or more files to upload or import: a secondary `Button` with an upload icon, the chosen
file's name beside it, and a Clear button once something is chosen.

## How it is built

The native `<input type="file">` stays in the page, visually hidden, and is **the real control**:

- **Keyboard:** Tab reaches the native input; Space or Enter opens the system picker. The visible
  button draws the focus ring while the input has keyboard focus.
- **Screen readers** hear a file picker named by its `Field` label, with its chosen file.
- **Forms** submit it by `name`, like any input.
- The visible button is for the **pointer only** (`aria-hidden`, out of the tab order); it opens
  the same picker. A `Field` label click opens it too.

## Geometry

The button is a secondary `Button` — 32px, 28 with `size="dense"`, **44px under a coarse pointer**.
The file name follows in `mono-control`, `ds-text-2`, on one line with an ellipsis; several files
read "3 files". The full list is in the name's `title`. With nothing chosen it reads "No file
chosen" in `ds-text-3`. `invalid` puts a `ds-danger` edge on the button; disabled dims all of it
to 45%.

## In a Field

```svelte
<Field label="Import file" {error} required>
  {#snippet children(f)}
    <FileInput id={f.id} aria-describedby={f.describedBy} invalid={f.invalid}
      accept=".csv" bind:files onfiles={check} />
  {/snippet}
</Field>
```

Say what is wrong — the wrong type, too large — with the Field's `error`, not by disabling the
upload.

## What the consumer provides

`accept`, `multiple`, `disabled`, `invalid`, `required`, `name`, `id`, `label` (the button text;
default "Choose file", or "Choose files" with `multiple`), `size` (`dense` | `default`), `files`
(bindable `File[]`), `onfiles(files)` (also called with `[]` on Clear), `element` (bindable, the
native input), `class`, and any other `<input>` attribute.

There is no drag-and-drop target in this version; a drop zone is a larger surface with its own
states and belongs in its own primitive.

## Don't

- Don't hide the file name; the operator needs to see what is about to be sent.
- Don't start the upload on choice for anything irreversible; choosing is not confirming.
- Don't style a bare `<input type="file">` in a page; use this.
