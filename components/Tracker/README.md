# Tracker

Where a multi-step process stands: one row of segments, a mark and a label per step. Past steps are
complete (accent), the current step is marked (accent text, weight 500), the rest are still to come.
It reports progress and takes no input. It is not `Steps` (a numbered how-to) and not a form wizard.

## States

- `active` (default): steps before `current` are complete, `current` is marked.
- `stopped`: the current step is marked in the `stoppedTone` — `danger` (default) or `warning` — for
  a process that is stuck, failed or held there. The tone is never the only cue: the step's name is
  followed, for a screen reader, by "stopped", and the summary says where.
- `done`: every step is complete and none is current.

## Accessibility

The list is named by its summary, "Step 3 of 6: Downloading"; once `done`, "All 6 steps complete".
The words come from `strings` (`trackerStep`, `trackerDone`, `trackerComplete`, `trackerStopped`).
The current step has `aria-current="step"`. `label` replaces the summary as the list's name.

## Narrow widths

Under 540px of its own width (a container query) only the current step's label shows, in a wider
segment; the others are marks. When `done`, the last step's label shows. The hidden labels stay
readable to a screen reader. Nothing scrolls sideways at 320px.

## What the consumer provides

`steps` (labels, or `{ label, title }` where `title` is a tooltip on that step), `current` (0-based;
clamped to the steps), `state`, `stoppedTone`, `label`, `class`.

## Don't

- Don't use it for steps the user performs one after another in a form.
- Don't go past about eight steps; long labels truncate with an ellipsis.
- Don't put the explanation of a stop in the tracker; show it next to it.
