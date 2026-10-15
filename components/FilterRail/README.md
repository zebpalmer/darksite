# FilterRail

The filter panel beside a list or grid in a work view: grouped sections of options, 264px wide,
its own scroll, with a "Clear all" in its header once anything is on.

It **collapses rather than shrinks** — to a 44px strip whose toggle says how many filters are on
("Show filters (2 on)"). Under 768px it becomes a "Filters · 2" button that opens the sections in a
`Sheet`.

## Sections

`{ key, label, type?, options?, multiple?, unsetLabel?, placeholder?, labelFor?, onsearch?, loading?, strict? }`.
Three types:

- **`options`** (the default): `options: { value, label, count? }[]`, multiple-choice (checkboxes)
  by default; `multiple: false` makes it single-choice (radios, with "Any" to clear it). Counts sit
  at the right in 12px `ds-text-3`. When no filter here means a default rather than every value, name
  the unset choice per section with `unsetLabel` ("Default", "Current").
- **`text`**: one free-text value ("Name contains"), in an `Input`. It applies on Enter or when the
  field is left — not on every keystroke, so the URL and the results do not churn — and clears at
  once when emptied. `placeholder` is the hint.
- **`search`**: a `Combobox` over `options`, for a list too long to show as checkboxes (owners,
  assignees, any entity). Each chosen value shows below it as a removable `Chip`; `multiple: false`
  keeps one. For server search, give `onsearch(text)` (the Combobox stops filtering locally), feed
  results back as `options`, and set `loading` while they come.

## Values the options do not list

A selected value that is not in `options` — from a linked URL, a list that is partial or still
loading, an option that has since gone away — **stays selected and stays visible**. It shows as an
extra, checked row in an options section (uncheck it to remove it) and as a chip in a search
section and in `ActiveFilters`. Its label is `labelFor(value)` when the app can name it (an id it
can look up), otherwise the value as it is. Dropping it silently would change what a shared link
shows. A section that must accept only its options sets `strict: true`.

## ActiveFilters

Put `ActiveFilters` above the results with the same `sections` and `value`. It shows each applied
filter as a removable `Chip` ("Status: On hold ×") plus "Clear all", so a collapsed rail — or a
phone, where the rail is a sheet — never hides what is on. It renders nothing when no filter is on.

## Keep the state in the URL

A filtered view should be linkable and survive a reload. `filtersToParams(value, sections, base)`
writes one query entry per selected value and keeps unrelated params; `filtersFromParams(params,
sections)` reads them back — keeping values the options do not list unless the section is `strict`,
dropping empty ones, and keeping one value for a `text` or single-choice section. `filterLabel` and
`unlistedValues` give a product the same labels and leftovers the rail shows. In SvelteKit:

```svelte
<script>
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { FilterRail, filtersFromParams, filtersToParams } from 'darksite';

	let value = $state(filtersFromParams(page.url.searchParams, sections));
	const sync = (next) => replaceState(`?${filtersToParams(next, sections, page.url.searchParams)}`, {});
</script>

<FilterRail {sections} bind:value onchange={sync} />
```

On a prerendered page, read the params once in the browser rather than during prerendering.

## What the consumer provides

`sections`, `value` (bindable), `collapsed` (bindable), `title` (default "Filters"),
`onchange(value)`, `class`.

In a full work view, put the rail in `WorkView`'s `rail` snippet; it stretches to the full height
beside the results.

## Don't

- Don't squeeze the rail below its width — collapse it.
- Don't keep filter state only in memory; a reload should not lose it.
