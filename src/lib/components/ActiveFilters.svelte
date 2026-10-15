<!--
@component
ActiveFilters — the applied filters as removable Chips above the results, so a collapsed rail (or
a phone, where the rail is a Sheet) never hides what is on. Renders nothing when no filter is on.

- `sections`, `value` (bindable — the same as the FilterRail's), `onchange(value)`. A value the
  section's options do not list is shown by `labelFor(value)` or as it is; free text is quoted.
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Chip from './Chip.svelte';
	import { countActive, filterLabel, type FilterSection, type FilterValue } from '../filters.js';

	interface Props {
		sections: readonly FilterSection[];
		value?: FilterValue;
		onchange?: (value: FilterValue) => void;
		class?: string;
	}

	let { sections, value = $bindable({}), onchange, class: className = '' }: Props = $props();

	const applied = $derived(
		sections.flatMap((section) =>
			(value[section.key] ?? []).map((v) => ({
				section,
				value: v,
				label: section.type === 'text' ? `"${v}"` : filterLabel(section, v)
			}))
		)
	);

	function remove(sectionKey: string, v: string) {
		const list = (value[sectionKey] ?? []).filter((x) => x !== v);
		const next = { ...value };
		if (list.length) next[sectionKey] = list;
		else delete next[sectionKey];
		value = next;
		onchange?.(next);
	}

	function clearAll() {
		value = {};
		onchange?.({});
	}
</script>

{#if countActive(value) > 0}
	<div class="ds-activefilters {className}" role="group" aria-label="Active filters">
		{#each applied as item (`${item.section.key}:${item.value}`)}
			<Chip removable removeLabel="Remove {item.section.label}: {item.label}" onremove={() => remove(item.section.key, item.value)}>
				<span class="key">{item.section.label}:</span>
				{item.label}
			</Chip>
		{/each}
		<Button variant="ghost" size="dense" onclick={clearAll}>Clear all</Button>
	</div>
{/if}

<style>
	.ds-activefilters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}
	@media (pointer: coarse) {
		.ds-activefilters {
			gap: 8px;
		}
	}
	.key {
		color: var(--ds-text-3);
	}
</style>
