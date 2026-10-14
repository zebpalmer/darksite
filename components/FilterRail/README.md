# FilterRail

The filter panel beside a list or grid in a work view: grouped sections of options, 264px wide,
its own scroll, with a "Clear all" in its header once anything is on.

It **collapses rather than shrinks** — to a 44px strip whose toggle says how many filters are on
("Show filters (2 on)"). Under 768px it becomes a "Filters · 2" button that opens the sections in a
`Sheet`.

## Sections

`{ key, label, options: { value, label, count? }[], multiple? }`. A section is multiple-choice
(checkboxes) by default; `multiple: false` makes it single-choice (radios, with "Any" to clear it).
Counts sit at the right in 12px `ds-text-3`.

## ActiveFilters

Put `ActiveFilters` above the results with the same `sections` and `value`. It shows each applied
filter as a removable `Chip` ("Status: On hold ×") plus "Clear all", so a collapsed rail — or a
phone, where the rail is a sheet — never hides what is on. It renders nothing when no filter is on.

## Keep the state in the URL

A filtered view should be linkable and survive a reload. `filtersToParams(value, sections, base)`
writes one query entry per selected value and keeps unrelated params; `filtersFromParams(params,
sections)` reads them back, dropping anything that isn't an option. In SvelteKit:

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

## Don't

- Don't squeeze the rail below its width — collapse it.
- Don't keep filter state only in memory; a reload should not lose it.
