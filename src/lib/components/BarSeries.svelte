<script lang="ts" module>
	import type { ChartTone } from '../chart.js';

	/** One stacked series: its key in each point's `values`, its name, its color. */
	export interface BarSeriesSeries {
		key: string;
		label: string;
		tone?: ChartTone;
	}

	/** One bar: a period ("Oct 2", "Week 41") and each series' value in it. */
	export interface BarSeriesPoint {
		label: string;
		/** A fuller name for the tooltip and the table ("Oct 2, 2026"). Default: `label`. */
		title?: string;
		values: Record<string, number | null | undefined>;
	}
</script>

<!--
@component
BarSeries — a few values over time, stacked: one bar per period, each split into up to six
categorical series, oldest on the left. Deliberately small: no axes library, no zoom, no pan. The
scale is drawn as one line at the top labeled with its value and a baseline at zero; under the bars,
the first and last periods are named (and the middle one when there are five or more).

Hover a bar, or focus the chart and use ← / → (Home / End), for a tooltip with the period, each
series' value and the total. Every value is also in a data table that assistive technology reads in
place of the drawing, with a row per period and a column per series.

- `series` (`{ key, label, tone? }[]`; colors by position from `ds-cat-1`, up to six), `data`
  (`{ label, title?, values }[]`, in time order), `label` (the chart's name and the table's
  caption), `max` (the scale; default the largest total), `height` (CSS px of the plot, default
  160), `format(value)`, `legend` (default true; hidden for a single series), `class`.

Fewer than three periods is a `Meter` or a `Stat`; a proportion of one whole is a `Ring`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import { chartColor } from '../chart.js';
	import ChartTip from './ChartTip.svelte';

	interface Props {
		series: readonly BarSeriesSeries[];
		data: readonly BarSeriesPoint[];
		label: string;
		max?: number;
		height?: number;
		format?: (value: number) => string;
		legend?: boolean;
		class?: string;
	}

	let {
		series,
		data,
		label,
		max,
		height = 160,
		format = (v: number) => v.toLocaleString(),
		legend = true,
		class: className = ''
	}: Props = $props();

	const num = (v: number | null | undefined) => (typeof v === 'number' && v > 0 ? v : 0);
	const totals = $derived(data.map((p) => series.reduce((sum, s) => sum + num(p.values[s.key]), 0)));
	const scale = $derived(max ?? Math.max(0, ...totals));
	const colors = $derived(series.map((s, i) => chartColor(s.tone, i)));
	const labeled = $derived.by(() => {
		const n = data.length;
		const at = new Set<number>(n ? [0, n - 1] : []);
		if (n >= 5) at.add(Math.floor((n - 1) / 2));
		return at;
	});

	let active = $state<number | null>(null);
	let bars = $state<HTMLElement[]>([]);
	const anchor = $derived(active === null ? null : (bars[active] ?? null));

	function onkeydown(event: KeyboardEvent) {
		if (!data.length) return;
		const last = data.length - 1;
		const at = active ?? last;
		const moves: Record<string, number> = {
			ArrowLeft: Math.max(0, at - 1),
			ArrowRight: Math.min(last, at + 1),
			Home: 0,
			End: last
		};
		if (event.key in moves) {
			event.preventDefault();
			active = moves[event.key];
		} else if (event.key === 'Escape' && active !== null) {
			event.stopPropagation();
			active = null;
		}
	}
</script>

<figure class="ds-barseries {className}">
	<span class="scale" aria-hidden="true">{format(scale)}</span>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (the arrows only show the tooltip; the table below holds the values) -->
	<div
		class="plot"
		role="img"
		aria-label={label}
		tabindex={data.length ? 0 : undefined}
		style:height="{height}px"
		data-dense={data.length > 40 ? '' : undefined}
		{onkeydown}
		onfocus={() => (active ??= data.length ? data.length - 1 : null)}
		onblur={() => (active = null)}
		onpointerleave={(e) => e.pointerType === 'mouse' && (active = null)}
	>
		<div class="bars">
			{#each data as point, i (i)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="slot"
					data-active={active === i ? '' : undefined}
					onpointerenter={() => (active = i)}
					aria-hidden="true"
				>
					<div class="pile" bind:this={bars[i]}>
						{#each series as s, j (s.key)}
							{@const v = num(point.values[s.key])}
							{#if v > 0 && scale > 0}
								<span
									class="seg"
									style:height="{(Math.min(v, scale) / scale) * height}px"
									style:background={colors[j]}
								></span>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="x" aria-hidden="true">
		{#each data as point, i (i)}
			<span class="tick">{#if labeled.has(i)}<span>{point.label}</span>{/if}</span>
		{/each}
	</div>
	{#if legend && series.length > 1}
		<ul class="legend" aria-hidden="true">
			{#each series as s, j (s.key)}
				<li><span class="swatch" style:background={colors[j]}></span>{s.label}</li>
			{/each}
		</ul>
	{/if}
	<!-- A table will not shrink to the hidden box, so the box is a div around it. -->
	<div class="ds-sr-only">
		<table>
			<caption>{label}</caption>
			<thead>
				<tr>
					<td></td>
					{#each series as s (s.key)}<th scope="col">{s.label}</th>{/each}
					{#if series.length > 1}<th scope="col">{strings.total}</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each data as point, i (i)}
					<tr>
						<th scope="row">{point.title ?? point.label}</th>
						{#each series as s (s.key)}<td>{format(num(point.values[s.key]))}</td>{/each}
						{#if series.length > 1}<td>{format(totals[i])}</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if active !== null && data[active]}
		{@const point = data[active]}
		<ChartTip {anchor}>
			<span class="tip-title">{point.title ?? point.label}</span>
			{#each series as s, j (s.key)}
				<span class="tip-row"
					><span class="tip-swatch" style:background={colors[j]}></span><span>{s.label}</span><span
						>{format(num(point.values[s.key]))}</span
					></span
				>
			{/each}
			{#if series.length > 1}
				<span class="tip-row"><span></span><span>{strings.total}</span><span>{format(totals[active])}</span></span>
			{/if}
		</ChartTip>
	{/if}
</figure>

<style>
	/* The root's margin reset sits in darksite's base layer at zero specificity, so it only clears
	   the browser's figure margin: the page's own rules, such as the article's rhythm, set the
	   space around the block. */
	@layer ds.base {
		:where(.ds-barseries) {
			margin: 0;
		}
	}
	.ds-barseries {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.plot {
		position: relative;
		border-top: 1px solid var(--ds-border-subtle);
		border-bottom: 1px solid var(--ds-border-strong);
		cursor: default;
	}
	.plot:focus-visible {
		outline-offset: 4px;
	}
	/* The scale's value, just above the line at the top of the plot that marks it. */
	.scale {
		margin-bottom: -4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-variant-numeric: tabular-nums;
	}
	.bars,
	.x {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		column-gap: 2px;
	}
	[data-dense] .bars {
		column-gap: 1px;
	}
	.bars {
		height: 100%;
	}
	.slot {
		display: flex;
		align-items: flex-end;
		min-width: 0;
		overflow: hidden;
		height: 100%;
		border-radius: 2px 2px 0 0;
	}
	.slot[data-active] {
		background: var(--ds-bg-3);
	}
	.pile {
		display: flex;
		flex-direction: column-reverse;
		gap: 0;
		width: 100%;
		min-height: 0;
	}
	.seg {
		display: block;
		flex: none;
		width: 100%;
	}
	.pile > .seg:last-child {
		border-radius: 2px 2px 0 0;
	}
	.x {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	/* A period's name may be wider than its bar: it overflows into its unlabeled neighbors. */
	.tick {
		display: flex;
		justify-content: center;
		min-width: 0;
		white-space: nowrap;
	}
	.tick:first-child {
		justify-content: flex-start;
	}
	.tick:last-child {
		justify-content: flex-end;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--ds-text-2);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.swatch {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
</style>
