<!--
@component
FilterRail — the filter panel beside a list or grid in a work view: grouped sections of options,
a "Clear all" in its header, its own scroll, 264px wide. It collapses to a 44px strip rather than
shrinking — the strip's toggle shows how many filters are on. Under 768px it is a "Filters" button
that opens the sections in a Sheet.

Pair it with ActiveFilters above the results, so a collapsed rail never hides what is applied, and
keep the state in the URL (`filtersToParams` / `filtersFromParams`) so a filtered view can be
linked and survives a reload.

- `sections` (`{ key, label, type?, options?, multiple?, placeholder?, labelFor?, onsearch?,
  loading?, strict? }[]`), `value` (bindable: selected values per section key), `collapsed`
  (bindable), `title` (default "Filters"), `onchange(value)`.
- Section types: `options` (default; checkboxes, or radios with `multiple: false`), `text` (one
  free-text value, applied on Enter or when the field is left), `search` (a Combobox over the
  options, for a long list such as owners; chosen values show as removable chips).
- A selected value the options do not list (a linked URL, options still loading) stays selected
  and is shown, labelled by `labelFor(value)` or the value itself.
-->
<script lang="ts">
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';

	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';
	import Chip from './Chip.svelte';
	import Combobox from './Combobox.svelte';
	import Input from './Input.svelte';
	import Radio from './Radio.svelte';
	import Sheet from './Sheet.svelte';
	import {
		countActive,
		filterLabel,
		unlistedValues,
		type FilterSection,
		type FilterValue
	} from '../filters.js';

	interface Props {
		sections: readonly FilterSection[];
		value?: FilterValue;
		collapsed?: boolean;
		title?: string;
		onchange?: (value: FilterValue) => void;
		class?: string;
	}

	let {
		sections,
		value = $bindable({}),
		collapsed = $bindable(false),
		title = 'Filters',
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let sheetOpen = $state(false);
	const active = $derived(countActive(value));

	function set(next: FilterValue) {
		value = next;
		onchange?.(next);
	}

	function toggle(section: FilterSection, option: string, on: boolean) {
		const current = value[section.key] ?? [];
		const list = on ? [...new Set([...current, option])] : current.filter((v) => v !== option);
		const next = { ...value };
		if (list.length) next[section.key] = list;
		else delete next[section.key];
		set(next);
	}

	function pick(section: FilterSection, option: string) {
		const next = { ...value };
		if (option) next[section.key] = [option];
		else delete next[section.key];
		set(next);
	}

	function setText(section: FilterSection, text: string) {
		const t = text.trim();
		if ((value[section.key]?.[0] ?? '') === t) return;
		pick(section, t);
	}

	function add(section: FilterSection, option: string) {
		if (section.multiple === false) pick(section, option);
		else toggle(section, option, true);
	}

	function choices(section: FilterSection) {
		const chosen = new Set(value[section.key] ?? []);
		return (section.options ?? [])
			.filter((o) => !chosen.has(o.value))
			.map((o) => ({
				value: o.value,
				label: o.label,
				meta: o.count === undefined ? undefined : o.count.toLocaleString()
			}));
	}

	function clearAll() {
		set({});
	}
</script>

{#snippet controls(prefix: string)}
	{#each sections as section (section.key)}
		{@const fieldId = `${prefix}-${section.key}`}
		{#if section.type === 'text'}
			<div class="section">
				<label class="legend" for={fieldId}>{section.label}</label>
				<Input
					id={fieldId}
					type="search"
					value={value[section.key]?.[0] ?? ''}
					placeholder={section.placeholder}
					autocomplete="off"
					onchange={(e) => setText(section, e.currentTarget.value)}
					oninput={(e) => e.currentTarget.value === '' && setText(section, '')}
				/>
			</div>
		{:else if section.type === 'search'}
			<div class="section">
				<label class="legend" for={fieldId}>{section.label}</label>
				<Combobox
					id={fieldId}
					items={choices(section)}
					placeholder={section.placeholder}
					filter={!section.onsearch}
					oninput={section.onsearch}
					loading={section.loading}
					onselect={(item) => add(section, item.value)}
				/>
				{#if value[section.key]?.length}
					<div class="chosen">
						{#each value[section.key] as v (v)}
							<Chip
								removable
								removeLabel="Remove {section.label}: {filterLabel(section, v)}"
								onremove={() => toggle(section, v, false)}>{filterLabel(section, v)}</Chip
							>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			{@const unlisted = unlistedValues(section, value)}
			<fieldset class="section">
				<legend>{section.label}</legend>
				{#if section.multiple === false}
					<Radio
						name="{prefix}-{section.key}"
						value=""
						label="Any"
						group={value[section.key]?.[0] ?? ''}
						onchange={() => pick(section, '')}
					/>
					{#each [...(section.options ?? []), ...unlisted.map( (v) => ({ value: v, label: filterLabel(section, v), count: undefined }) )] as option (option.value)}
						<span class="option">
							<Radio
								name="{prefix}-{section.key}"
								value={option.value}
								label={option.label}
								group={value[section.key]?.[0] ?? ''}
								onchange={() => pick(section, option.value)}
							/>
							{#if option.count !== undefined}<span class="count">{option.count.toLocaleString()}</span>{/if}
						</span>
					{/each}
				{:else}
					{#each [...(section.options ?? []), ...unlisted.map( (v) => ({ value: v, label: filterLabel(section, v), count: undefined }) )] as option (option.value)}
						<span class="option">
							<Checkbox
								label={option.label}
								checked={value[section.key]?.includes(option.value) ?? false}
								onchange={(on) => toggle(section, option.value, on)}
							/>
							{#if option.count !== undefined}<span class="count">{option.count.toLocaleString()}</span>{/if}
						</span>
					{/each}
				{/if}
			</fieldset>
		{/if}
	{/each}
{/snippet}

<aside class="ds-filterrail {className}" data-collapsed={collapsed ? '' : undefined} aria-label={title}>
	{#if collapsed}
		<div class="strip">
			<Button
				variant="icon"
				label={active ? `Show ${title.toLowerCase()} (${active} on)` : `Show ${title.toLowerCase()}`}
				icon={ListFilter}
				onclick={() => (collapsed = false)}
			/>
			{#if active}<span class="badge" aria-hidden="true">{active}</span>{/if}
		</div>
	{:else}
		<div class="head">
			<h2 id="{uid}-title">{title}</h2>
			{#if active}<span class="active">{active} on</span>{/if}
			<span class="grow"></span>
			{#if active}<Button variant="ghost" size="dense" onclick={clearAll}>Clear all</Button>{/if}
			<Button variant="icon" size="dense" label="Collapse {title.toLowerCase()}" icon={PanelLeftClose} onclick={() => (collapsed = true)} />
		</div>
		<div class="body">{@render controls(`${uid}-rail`)}</div>
	{/if}
</aside>

<div class="ds-filterrail-phone">
	<Button icon={ListFilter} onclick={() => (sheetOpen = true)}>
		{title}{#if active}<span class="phone-count">&nbsp;· {active}</span>{/if}
	</Button>
	<Sheet bind:open={sheetOpen} {title}>
		{@render controls(`${uid}-sheet`)}
		{#snippet footer()}
			{#if active}<Button variant="ghost" onclick={clearAll}>Clear all</Button>{/if}
			<Button variant="primary" onclick={() => (sheetOpen = false)}>Done</Button>
		{/snippet}
	</Sheet>
</div>

<style>
	.ds-filterrail {
		display: flex;
		flex-direction: column;
		flex: none;
		width: 264px;
		min-height: 0;
		border-right: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
	}
	.ds-filterrail[data-collapsed] {
		width: 44px;
	}
	.strip {
		position: relative;
		display: flex;
		justify-content: center;
		padding-top: 8px;
	}
	.badge {
		position: absolute;
		top: 4px;
		right: 2px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent);
		color: var(--ds-accent-contrast);
		font-size: var(--ds-text-xs);
		line-height: 16px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: none;
		height: 44px;
		padding: 0 8px 0 14px;
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	h2 {
		margin: 0;
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		font-weight: 500;
	}
	.active {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		white-space: nowrap;
	}
	.grow {
		flex: 1;
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 4px 14px 16px;
	}
	.section {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 10px 0 0;
		border: 0;
	}
	legend,
	.legend {
		padding: 10px 0 2px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		font-weight: 500;
	}
	.legend {
		display: block;
		padding-bottom: 6px;
	}
	.chosen {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding-top: 8px;
	}
	.option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-width: 0;
	}
	.count {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	.ds-filterrail-phone {
		display: none;
	}
	.phone-count {
		color: var(--ds-text-3);
	}
	@media (max-width: 767.98px) {
		.ds-filterrail {
			display: none;
		}
		.ds-filterrail-phone {
			display: block;
		}
	}
</style>
