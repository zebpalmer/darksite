<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** One column. `value` defaults to `row[key]`. */
	export interface TableColumn<T> {
		key: string;
		label: string;
		/** `end` for numbers. */
		align?: 'start' | 'end';
		/** A CSS width, e.g. `'120px'` or `'20%'`. */
		width?: string;
		/** 1 = never hidden, 2 = hidden below a 480px table, 3 = hidden below 720px. */
		priority?: 1 | 2 | 3;
		/** Serials, hashes, paths: mono with tabular figures. */
		mono?: boolean;
		sortable?: boolean;
		value?: (row: T) => unknown;
		/** Custom rendering for this column's cells. */
		cell?: Snippet<[T]>;
	}

	export interface TableSort {
		key: string;
		direction: 'asc' | 'desc';
	}
</script>

<!--
@component
Table — rows and columns. `Grid` is for cards; this is for everything else.

Header 34px; rows 40px, 32 with `density="dense"`, 44 under a coarse pointer whatever was passed.
The table owns its scrolling: in a work view give it a bounded height (it is the pane's scrolling
body) and the header sticks; in a content page the document scrolls and the header does not stick.
Low-priority columns drop as the table narrows (container width, never the viewport). Cells are one
line with an ellipsis and the full value in `title`. Empty values render the missing-value mark.

The consumer owns the data: sorting calls `onsort`, selection is a bindable set of row keys, and
paging is "Load more" below the table (docs/layout.md, "Long lists"). Bulk actions for a selection
belong in the pane's ActionBar.
-->
<script lang="ts" generics="T">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

	import Checkbox from './Checkbox.svelte';
	import EmptyState from './EmptyState.svelte';
	import Missing from './Missing.svelte';
	import SkeletonLoader from './SkeletonLoader.svelte';

	interface Props {
		rows: readonly T[];
		columns: readonly TableColumn<T>[];
		rowKey: (row: T) => string;
		/** The table's accessible name. */
		label: string;
		density?: 'default' | 'dense';
		selectable?: boolean;
		selected?: Set<string>;
		sort?: TableSort | null;
		onsort?: (sort: TableSort) => void;
		/** Makes the whole row a link: pointer click, and Enter on a focused row. */
		href?: (row: T) => string | undefined;
		/** Fallback rendering for any column without its own `cell`. */
		cell?: Snippet<[{ row: T; column: TableColumn<T>; value: unknown }]>;
		empty?: Snippet;
		loading?: boolean;
		loadingRows?: number;
		/** What an empty value shows. */
		missing?: string;
		/** A minimum width; below it the table scrolls sideways inside its container. */
		minWidth?: string;
		class?: string;
	}

	let {
		rows,
		columns,
		rowKey,
		label,
		density = 'default',
		selectable = false,
		selected = $bindable(new Set<string>()),
		sort = $bindable(null),
		onsort,
		href,
		cell,
		empty,
		loading = false,
		loadingRows = 5,
		missing = '—',
		minWidth,
		class: className = ''
	}: Props = $props();

	let focusIndex = $state(0);
	let lastClicked: number | null = null;
	const rowEls: HTMLTableRowElement[] = $state([]);

	const span = $derived(columns.length + (selectable ? 1 : 0));
	const keys = $derived(rows.map(rowKey));
	const selectedCount = $derived(keys.filter((k) => selected.has(k)).length);
	const headerChecked = $derived<boolean | 'mixed'>(
		selectedCount === 0 ? false : selectedCount === keys.length ? true : 'mixed'
	);

	function valueOf(row: T, column: TableColumn<T>): unknown {
		return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
	}

	function isMissing(value: unknown): boolean {
		return value === null || value === undefined || value === '';
	}

	function ariaSort(column: TableColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
		if (!column.sortable) return undefined;
		if (sort?.key !== column.key) return 'none';
		return sort.direction === 'asc' ? 'ascending' : 'descending';
	}

	function toggleSort(key: string) {
		const next: TableSort =
			sort?.key === key
				? { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
				: { key, direction: 'asc' };
		sort = next;
		onsort?.(next);
	}

	function toggleAll() {
		const next = new Set(selected);
		if (headerChecked === true) for (const k of keys) next.delete(k);
		else for (const k of keys) next.add(k);
		selected = next;
	}

	function setRange(from: number, to: number, on: boolean) {
		const next = new Set(selected);
		for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
			if (on) next.add(keys[i]);
			else next.delete(keys[i]);
		}
		selected = next;
	}

	function clickRowCheckbox(event: MouseEvent, index: number) {
		const on = !selected.has(keys[index]);
		setRange(event.shiftKey && lastClicked !== null ? lastClicked : index, index, on);
		lastClicked = index;
	}

	function isInteractive(target: EventTarget | null): boolean {
		return target instanceof Element && !!target.closest('a, button, input, label, select, textarea');
	}

	function openRow(index: number) {
		rowEls[index]?.querySelector<HTMLAnchorElement>('a.row-link')?.click();
	}

	function onRowClick(event: MouseEvent, index: number) {
		if (isInteractive(event.target)) return;
		openRow(index);
	}

	function focusRow(index: number) {
		const i = Math.max(0, Math.min(rows.length - 1, index));
		focusIndex = i;
		rowEls[i]?.focus();
	}

	function onRowKeydown(event: KeyboardEvent, index: number) {
		if (event.target !== event.currentTarget) return;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusRow(index + 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusRow(index - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusRow(0);
				break;
			case 'End':
				event.preventDefault();
				focusRow(rows.length - 1);
				break;
			case ' ':
				if (!selectable) return;
				event.preventDefault();
				setRange(index, index, !selected.has(keys[index]));
				lastClicked = index;
				break;
			case 'Enter':
				if (!href) return;
				event.preventDefault();
				openRow(index);
				break;
		}
	}
</script>

{#snippet content(row: T, column: TableColumn<T>, value: unknown)}
	{#if column.cell}
		{@render column.cell(row)}
	{:else if cell}
		{@render cell({ row, column, value })}
	{:else if isMissing(value)}
		<Missing mark={missing} />
	{:else}
		{String(value)}
	{/if}
{/snippet}

<div class="ds-table {className}" data-density={density} style:--ds-table-min={minWidth}>
	<table aria-label={label} aria-busy={loading ? 'true' : undefined}>
		<thead>
			<tr>
				{#if selectable}
					<th class="sel" scope="col">
						<Checkbox
							hideLabel
							label="Select all rows"
							checked={headerChecked}
							disabled={loading || rows.length === 0}
							onchange={toggleAll}
						/>
					</th>
				{/if}
				{#each columns as column (column.key)}
					<th
						scope="col"
						data-align={column.align ?? 'start'}
						data-priority={column.priority ?? 1}
						style:width={column.width}
						aria-sort={ariaSort(column)}
					>
						{#if column.sortable}
							<button type="button" class="sort" onclick={() => toggleSort(column.key)}>
								<span>{column.label}</span>
								{#if sort?.key === column.key}
									{#if sort.direction === 'asc'}<ArrowUp size={16} aria-hidden="true" />{:else}<ArrowDown
											size={16}
											aria-hidden="true"
										/>{/if}
								{:else}
									<ArrowUpDown size={16} aria-hidden="true" class="idle" />
								{/if}
							</button>
						{:else}
							{column.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if loading}
				{#each Array.from({ length: loadingRows }, (_, i) => i) as i (i)}
					<tr class="skeleton">
						{#if selectable}<td class="sel"></td>{/if}
						{#each columns as column (column.key)}
							<td data-priority={column.priority ?? 1}>
								<SkeletonLoader label={null} width={i % 2 ? '45%' : '65%'} />
							</td>
						{/each}
					</tr>
				{/each}
			{:else if rows.length === 0}
				<tr class="empty">
					<td colspan={span}>
						{#if empty}{@render empty()}{:else}<EmptyState title="Nothing to show" />{/if}
					</td>
				</tr>
			{:else}
				{#each rows as row, index (keys[index])}
					{@const link = href?.(row)}
					<tr
						bind:this={rowEls[index]}
						tabindex={index === focusIndex ? 0 : -1}
						data-selected={selectable && selected.has(keys[index]) ? '' : undefined}
						data-link={link ? '' : undefined}
						onclick={(event) => onRowClick(event, index)}
						onkeydown={(event) => onRowKeydown(event, index)}
						onfocus={() => (focusIndex = index)}
					>
						{#if selectable}
							<td class="sel">
								<Checkbox
									hideLabel
									label="Select row"
									checked={selected.has(keys[index])}
									onclick={(event) => clickRowCheckbox(event, index)}
								/>
							</td>
						{/if}
						{#each columns as column, ci (column.key)}
							{@const value = valueOf(row, column)}
							<td
								data-align={column.align ?? 'start'}
								data-priority={column.priority ?? 1}
								data-mono={column.mono ? '' : undefined}
							>
								<div
									class="cell"
									title={!column.cell && !cell && !isMissing(value) ? String(value) : undefined}
								>
									{#if ci === 0 && link}
										<a class="row-link" href={link} tabindex="-1">{@render content(row, column, value)}</a>
									{:else}
										{@render content(row, column, value)}
									{/if}
								</div>
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.ds-table {
		container-type: inline-size;
		position: relative;
		min-width: 0;
		overflow: auto;
		--row-h: 40px;
	}
	.ds-table[data-density='dense'] {
		--row-h: 32px;
	}
	@media (pointer: coarse) {
		.ds-table,
		.ds-table[data-density] {
			--row-h: var(--ds-h-touch);
		}
	}
	table {
		width: 100%;
		min-width: var(--ds-table-min, 0);
		table-layout: fixed;
		border-collapse: separate;
		border-spacing: 0;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.ds-table[data-density='dense'] table {
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	th,
	td {
		padding: 0 12px;
		text-align: start;
		vertical-align: middle;
	}
	th:first-child,
	td:first-child {
		padding-inline-start: var(--ds-table-inset, 12px);
	}
	th:last-child,
	td:last-child {
		padding-inline-end: var(--ds-table-inset, 12px);
	}
	th {
		position: sticky;
		top: 0;
		z-index: var(--ds-z-raised);
		height: 34px;
		border-bottom: 1px solid var(--ds-border);
		background: var(--ds-table-bg, var(--ds-bg-1));
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-weight: 500;
		white-space: nowrap;
	}
	td {
		height: var(--row-h);
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	[data-align='end'] {
		text-align: end;
	}
	th.sel,
	td.sel {
		width: 44px;
		padding-inline: 6px;
		text-align: center;
	}
	.cell {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	td[data-mono] .cell {
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.sort {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		max-width: 100%;
		margin: 0 -4px;
		padding: 2px 4px;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.sort:hover {
		color: var(--ds-text-1);
	}
	.sort span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sort :global(.idle) {
		opacity: 0.5;
	}
	[data-align='end'] .sort {
		flex-direction: row-reverse;
	}
	tbody tr:focus-visible {
		outline: 2px solid var(--ds-focus);
		outline-offset: -2px;
	}
	tbody tr[data-link] {
		cursor: pointer;
	}
	tbody tr[data-link]:hover td,
	tbody tr:not(.empty):not(.skeleton):hover td {
		background: var(--ds-bg-2);
	}
	tbody tr[data-selected] td {
		background: var(--ds-accent-tint);
	}
	tbody tr[data-selected]:hover td {
		background: var(--ds-accent-tint-hover);
	}
	.row-link {
		color: inherit;
		text-decoration: none;
	}
	tr.empty td {
		height: auto;
		padding: 16px var(--ds-table-inset, 12px);
		border-bottom: 0;
	}
	@container (max-width: 720px) {
		[data-priority='3'] {
			display: none;
		}
	}
	@container (max-width: 480px) {
		[data-priority='2'] {
			display: none;
		}
	}
</style>
