<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** One column. `value` defaults to `row[key]`. */
	export interface TableColumn<T> {
		key: string;
		/** The header. Always give one, even for a column that shows none (see `hideLabel`). */
		label: string;
		/** Read by assistive technology, not shown: for a column whose cells explain themselves
		 *  (a row action, a checkbox, a small chart), where a visible header would be clutter. */
		hideLabel?: boolean;
		/** `end` for numbers. */
		align?: 'start' | 'end';
		/** A CSS width: `'120px'`, `'20%'`, or a range like `'clamp(120px, 30%, 240px)'` (resolved
		 *  against the table's width, which fixed table layout cannot do itself). */
		width?: string;
		/** 1 = never hidden, 2 = hidden below a 480px table, 3 = below 720px (see `hideBelow`). */
		priority?: 1 | 2 | 3;
		/** Serials, hashes, paths: mono with tabular figures. */
		mono?: boolean;
		sortable?: boolean;
		/** What the column means, as a HelpTip beside the header ("Weighted median of the last 7
		 *  days"). For a definition a reader needs, not for a label that explains itself. */
		tip?: string;
		value?: (row: T) => unknown;
		/** Custom rendering for this column's cells. */
		cell?: Snippet<[T]>;
	}

	export interface TableSort {
		key: string;
		direction: 'asc' | 'desc';
	}

	/** One group of rows under its header row, in the order the groups first appear. */
	export interface TableGroup<T> {
		key: string;
		label: string;
		rows: T[];
		count: number;
	}

	/** A semantic row mark. A severity is `rowSeverity`, never one of these. */
	export type TableRowTone = 'accent' | 'success' | 'warning' | 'danger';

	/** The table widths below which priority 2 and 3 columns are hidden. */
	export interface TablePriorityWidths {
		2?: number;
		3?: number;
	}

	export const DEFAULT_PRIORITY_WIDTHS = { 2: 480, 3: 720 } as const;

	/** The column priorities hidden at a table width. */
	export function hiddenPriorities(width: number, hideBelow: TablePriorityWidths = {}): (2 | 3)[] {
		const at = { ...DEFAULT_PRIORITY_WIDTHS, ...hideBelow };
		return ([2, 3] as const).filter((p) => width < at[p]);
	}
</script>

<!--
@component
Table — rows and columns. `Grid` is for cards; this is for everything else.

Header 34px; rows 40px, 32 with `density="dense"`, 44 under a coarse pointer whatever was passed.
The table owns its scrolling: in a work view give it a bounded height (it is the pane's scrolling
body) and the header sticks; in a content page the document scrolls and the header does not stick.
Low-priority columns drop as the table narrows (container width, never the viewport; `hideBelow`
moves the thresholds). Cells are one line with an ellipsis and the full value in `title`. Empty
values render the missing-value mark.

`groupBy` puts rows under group header rows inside the one table (`group` snippet for a custom
header). `rowTone` / `rowSeverity` mark a row with a 3px leading stripe; the row must also say it
in words (a StatusBadge or SeverityBadge in a cell). `striped` is a ledger's zebra rows: every
second row takes a faint stripe, restarting in each group; selection and row marks still show on it.

The consumer owns the data: sorting calls `onsort`, selection is a bindable set of row keys, and
paging is "Load more" below the table (docs/layout.md, "Long lists"). Bulk actions for a selection
belong in the pane's ActionBar.
-->
<script lang="ts" generics="T">
	import { strings } from '../strings.svelte.js';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

	import Checkbox from './Checkbox.svelte';
	import HelpTip from './HelpTip.svelte';
	import { severityVars, type Severity } from '../severity.js';
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
		/** Bindable. `undefined` is no selection, so it can be bound to a map entry not yet set. */
		selected?: Set<string>;
		/** Bindable. `undefined` is unsorted, so it can be bound to a map entry not yet set. */
		sort?: TableSort | null;
		onsort?: (sort: TableSort) => void;
		/** Makes the whole row a link: pointer click, and Enter on a focused row. */
		href?: (row: T) => string | undefined;
		/** The row link's accessible name. The link wraps the first cell, so without this it is
		 *  named by that cell: give one when the first cell does not say what the row is (a status,
		 *  a date, an icon). */
		rowLabel?: (row: T) => string;
		/** Fallback rendering for any column without its own `cell`. */
		cell?: Snippet<[{ row: T; column: TableColumn<T>; value: unknown }]>;
		empty?: Snippet;
		loading?: boolean;
		loadingRows?: number;
		/** What an empty value shows. */
		missing?: string;
		/** A minimum width; below it the table scrolls sideways inside its container. */
		minWidth?: string;
		/** Group rows under header rows by this key; groups keep the order they first appear in. */
		groupBy?: (row: T) => string;
		/** The group header's text; defaults to the key. */
		groupLabel?: (key: string) => string;
		/** A custom group header. */
		group?: Snippet<[TableGroup<T>]>;
		/** A semantic mark for a row: a 3px leading stripe. */
		rowTone?: (row: T) => TableRowTone | null | undefined;
		/** A severity mark for a row (wins over `rowTone`). */
		rowSeverity?: (row: T) => Severity | null | undefined;
		/** Table widths below which priority 2 / 3 columns hide (default 480 / 720). */
		hideBelow?: TablePriorityWidths;
		/** A ledger: every second row takes a faint stripe (restarting in each group). */
		striped?: boolean;
		class?: string;
	}

	let {
		rows,
		columns,
		rowKey,
		label,
		density = 'default',
		selectable = false,
		// No fallbacks: a bindable prop with one rejects `bind:sort={map[key]}` while the entry is
		// undefined. `undefined` reads as no selection and no sort.
		selected = $bindable(),
		sort = $bindable(),
		onsort,
		href,
		rowLabel,
		cell,
		empty,
		loading = false,
		loadingRows = 5,
		missing = '—',
		minWidth,
		groupBy,
		groupLabel,
		group,
		rowTone,
		rowSeverity,
		hideBelow,
		striped = false,
		class: className = ''
	}: Props = $props();

	let focusIndex = $state(0);
	let lastClicked: number | null = null;
	const rowEls: HTMLTableRowElement[] = $state([]);

	const groups = $derived(groupBy ? groupRows(rows, groupBy) : null);
	// The rows in display order: grouped rows are shown group by group.
	const view = $derived(groups ? groups.flatMap((g) => g.rows) : rows);
	const keys = $derived(view.map(rowKey));
	// After a filter shrinks the rows, the stop moves to the last row instead of vanishing.
	const stopIndex = $derived(Math.max(0, Math.min(focusIndex, view.length - 1)));

	let root: HTMLDivElement | undefined = $state();
	let width = $state<number | null>(null);
	// Once measured, the table hides its columns itself; until then (server rendering, no
	// ResizeObserver) the container queries do, at the default widths.
	const hidden = $derived(width !== null ? hiddenPriorities(width, hideBelow) : []);
	// A full-width row (a group header, the empty state) spans the visible columns only. Spanning a
	// hidden one would add an empty track that takes the leftover width, and the rows would stop
	// short of the table's edge.
	const span = $derived(
		columns.filter((c) => !hidden.includes((c.priority ?? 1) as 2 | 3)).length + (selectable ? 1 : 0)
	);

	$effect(() => {
		if (!root || typeof ResizeObserver === 'undefined') return;
		const el = root;
		width = el.clientWidth;
		const ro = new ResizeObserver(() => (width = el.clientWidth));
		ro.observe(el);
		return () => ro.disconnect();
	});

	// Fixed table layout ignores a width that mixes a percentage into calc(), min(), max() or
	// clamp(): the column falls back to an even share. Such widths are resolved here, against the
	// table's own width, to pixels, and again whenever the table is resized.
	let tableEl: HTMLTableElement | undefined = $state();
	let resolved = $state<Record<string, string>>({});
	const MIXED_PERCENT = /\b(?:calc|min|max|clamp)\(.*%/;
	$effect(() => {
		void width;
		const el = tableEl;
		const needs = columns.filter((c) => c.width && MIXED_PERCENT.test(c.width));
		if (!el || !el.parentElement || !needs.length) {
			resolved = {};
			return;
		}
		const box = document.createElement('div');
		box.style.cssText = `position:absolute;visibility:hidden;height:0;overflow:hidden;width:${el.getBoundingClientRect().width}px`;
		const probe = document.createElement('div');
		box.append(probe);
		el.parentElement.append(box);
		const out: Record<string, string> = {};
		for (const c of needs) {
			probe.style.width = c.width!;
			out[c.key] = `${probe.getBoundingClientRect().width}px`;
		}
		box.remove();
		resolved = out;
	});

	function groupRows(list: readonly T[], by: (row: T) => string) {
		const map = new Map<string, T[]>();
		for (const row of list) {
			const key = by(row);
			const bucket = map.get(key);
			if (bucket) bucket.push(row);
			else map.set(key, [row]);
		}
		let start = 0;
		return [...map].map(([key, groupRows]) => {
			const g = { key, label: groupLabel?.(key) ?? key, rows: groupRows, count: groupRows.length, start };
			start += groupRows.length;
			return g;
		});
	}

	function markOf(row: T): string | undefined {
		const severity = rowSeverity?.(row);
		if (severity) return severityVars(severity).mark;
		const tone = rowTone?.(row);
		return tone ? `var(--ds-${tone})` : undefined;
	}
	const chosen = $derived(selected ?? new Set<string>());
	const selectedCount = $derived(keys.filter((k) => chosen.has(k)).length);
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
		const next = new Set(chosen);
		if (headerChecked === true) for (const k of keys) next.delete(k);
		else for (const k of keys) next.add(k);
		selected = next;
	}

	function setRange(from: number, to: number, on: boolean) {
		const next = new Set(chosen);
		for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
			if (on) next.add(keys[i]);
			else next.delete(keys[i]);
		}
		selected = next;
	}

	function clickRowCheckbox(event: MouseEvent, index: number) {
		const on = !chosen.has(keys[index]);
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
		const i = Math.max(0, Math.min(view.length - 1, index));
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
				focusRow(view.length - 1);
				break;
			case ' ':
				if (!selectable) return;
				event.preventDefault();
				setRange(index, index, !chosen.has(keys[index]));
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

<!-- `nth` is the row's place in its group (or the table), so a group's stripes start afresh. -->
{#snippet bodyRow(row: T, index: number, nth: number)}
	{@const link = href?.(row)}
	{@const mark = markOf(row)}
	<tr
		bind:this={rowEls[index]}
		tabindex={index === stopIndex ? 0 : -1}
		data-selected={selectable && chosen.has(keys[index]) ? '' : undefined}
		data-link={link ? '' : undefined}
		data-mark={mark ? '' : undefined}
		data-stripe={striped && nth % 2 === 1 ? '' : undefined}
		data-tone={rowSeverity?.(row) ?? rowTone?.(row) ?? undefined}
		style:--row-mark={mark}
		onclick={(event) => onRowClick(event, index)}
		onkeydown={(event) => onRowKeydown(event, index)}
		onfocus={() => (focusIndex = index)}
	>
		{#if selectable}
			<td class="sel">
				<Checkbox
					hideLabel
					label={strings.selectRow}
					checked={chosen.has(keys[index])}
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
						<a class="row-link" href={link} tabindex="-1" aria-label={rowLabel?.(row)}
							>{@render content(row, column, value)}</a
						>
					{:else}
						{@render content(row, column, value)}
					{/if}
				</div>
			</td>
		{/each}
	</tr>
{/snippet}

<div
	bind:this={root}
	class="ds-table {className}"
	data-density={density}
	data-striped={striped ? '' : undefined}
	data-priority-at={hideBelow || width !== null ? '' : undefined}
	data-hide={hidden.length ? hidden.join(' ') : undefined}
	style:--ds-table-min={minWidth}
>
	<table bind:this={tableEl} aria-label={label} aria-busy={loading ? 'true' : undefined}>
		<thead>
			<tr>
				{#if selectable}
					<th class="sel" scope="col">
						<Checkbox
							hideLabel
							label={strings.selectAllRows}
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
						style:width={resolved[column.key] ?? column.width}
						aria-sort={ariaSort(column)}
					>
						<span class="head">
						{#if column.sortable}
							<button type="button" class="sort" onclick={() => toggleSort(column.key)}>
								<span class:ds-sr-only={column.hideLabel}>{column.label}</span>
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
							<span class="label" class:ds-sr-only={column.hideLabel}>{column.label}</span>
						{/if}
						{#if column.tip}<HelpTip text={column.tip} label={strings.aboutColumn(column.label)} placement="bottom" />{/if}
						</span>
					</th>
				{/each}
			</tr>
		</thead>
		{#if loading || view.length === 0 || !groups}
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
				{:else if view.length === 0}
					<tr class="empty">
						<td colspan={span}>
							{#if empty}{@render empty()}{:else}<EmptyState title={strings.nothingToShow} />{/if}
						</td>
					</tr>
				{:else}
					{#each view as row, index (keys[index])}
						{@render bodyRow(row, index, index)}
					{/each}
				{/if}
			</tbody>
		{:else}
			{#each groups as g (g.key)}
				<tbody>
					<tr class="group-row">
						<th class="group" scope="rowgroup" colspan={span}>
							{#if group}
								{@render group({ key: g.key, label: g.label, rows: g.rows, count: g.count })}
							{:else}
								<span class="group-label">{g.label}</span>
								<span class="group-count">{g.count.toLocaleString()}</span>
							{/if}
						</th>
					</tr>
					{#each g.rows as row, i (keys[g.start + i])}
						{@render bodyRow(row, g.start + i, i)}
					{/each}
				</tbody>
			{/each}
		{/if}
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
	/* A header's label, sort button and tip, kept on one line at the column's alignment. */
	.head {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 100%;
		vertical-align: middle;
	}
	.head .label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sort {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		max-width: 100%;
		min-width: 0;
		padding: 2px 0;
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
		color: var(--ds-text-3);
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
	/* Striped: a ledger's zebra rows, a faint mix of the row divider into the table's ground. Hover
	   steps up to ds-bg-3 so it still shows on a stripe, and a selected row keeps its tint. */
	.ds-table[data-striped] tbody tr[data-stripe] td {
		background: color-mix(in oklab, var(--ds-border-subtle) 45%, var(--ds-table-bg, var(--ds-bg-1)));
	}
	.ds-table[data-striped] tbody tr:not(.empty, .skeleton):hover td {
		background: var(--ds-bg-3);
	}
	.ds-table[data-striped] tbody tr[data-selected] td {
		background: var(--ds-accent-tint);
	}
	.ds-table[data-striped] tbody tr[data-selected]:hover td {
		background: var(--ds-accent-tint-hover);
	}
	/* A row mark: a 3px leading stripe, drawn inside the first cell so it never shifts a column. */
	tbody tr[data-mark] > :first-child {
		box-shadow: inset 3px 0 0 var(--row-mark);
	}
	th.group {
		top: 34px;
		height: 32px;
		border-bottom: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-2);
		font-size: var(--ds-text-xs);
		text-align: start;
	}
	tbody:not(:first-of-type) th.group {
		border-top: 1px solid var(--ds-border-subtle);
	}
	.group-label {
		font-weight: 500;
	}
	.group-count {
		margin-inline-start: 6px;
		color: var(--ds-text-3);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
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
	@container (max-width: 719.98px) {
		.ds-table:not([data-priority-at]) [data-priority='3'] {
			display: none;
		}
	}
	@container (max-width: 479.98px) {
		.ds-table:not([data-priority-at]) [data-priority='2'] {
			display: none;
		}
	}
	.ds-table[data-hide~='2'] [data-priority='2'],
	.ds-table[data-hide~='3'] [data-priority='3'] {
		display: none;
	}
</style>
