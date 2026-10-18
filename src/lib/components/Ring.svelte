<script lang="ts" module>
	import type { ChartTone } from '../chart.js';

	/** One part of a Ring. */
	export interface RingSegment {
		label: string;
		value: number;
		tone?: ChartTone;
	}
</script>

<!--
@component
Ring — parts of one whole, as a ring: a `ds-bg-4` track with up to six categorical arcs, clockwise
from the top, 2px of track between them so no arc relies on color alone. The total (or what
`center` renders) sits in the middle; a legend beside it names each part with its value.

Hover an arc, or focus the ring and use ← / →, for a tooltip with its name, value and share. Every
value is also in a data table that assistive technology reads in place of the drawing.

- `segments` (`{ label, value, tone? }[]`; colors by position from `ds-cat-1`), `label` (the
  ring's name and the table's caption), `max` (default: the sum; a larger max leaves the rest as
  track, for "71 of 100"), `size` (px, default 112), `thickness` (px, default 12), `format(value)`,
  `center` snippet, or `centerValue` (default: the total) and `centerLabel` (a word under it),
  `legend` (default true), `class`.

A proportion on one line, in a row or a table, is a `Meter`; values over time are a `BarSeries`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { VirtualElement } from '@floating-ui/dom';
	import { strings } from '../strings.svelte.js';
	import { chartColor } from '../chart.js';
	import ChartTip from './ChartTip.svelte';

	interface Props {
		segments: readonly RingSegment[];
		label: string;
		max?: number;
		size?: number;
		thickness?: number;
		format?: (value: number) => string;
		center?: Snippet;
		centerValue?: string;
		centerLabel?: string;
		legend?: boolean;
		class?: string;
	}

	let {
		segments,
		label,
		max,
		size = 112,
		thickness = 12,
		format = (v: number) => v.toLocaleString(),
		center,
		centerValue,
		centerLabel,
		legend = true,
		class: className = ''
	}: Props = $props();

	const GAP = 2;
	const total = $derived(segments.reduce((sum, s) => sum + Math.max(0, s.value), 0));
	const scale = $derived(Math.max(max ?? total, total));
	const r = $derived((size - thickness) / 2);
	const c = $derived(2 * Math.PI * r);
	const colors = $derived(segments.map((s, i) => chartColor(s.tone, i)));
	const percent = (v: number) =>
		scale > 0 ? `${Math.round((Math.max(0, v) / scale) * 100).toLocaleString()}%` : '0%';

	/** Each arc's start and drawn length along the circle, with a gap after it. */
	const arcs = $derived.by(() => {
		const visible = segments.filter((s) => s.value > 0).length;
		const gaps = visible > 1 || (visible === 1 && scale > total);
		let start = 0;
		return segments.map((s) => {
			const len = scale > 0 ? (Math.max(0, s.value) / scale) * c : 0;
			const draw = len > 0 ? Math.max(1, gaps ? len - GAP : len) : 0;
			const arc = { start, draw };
			start += len;
			return arc;
		});
	});

	let active = $state<number | null>(null);
	let svg = $state<SVGSVGElement>();
	const firstShown = $derived(segments.findIndex((s) => s.value > 0));

	/** A point at the middle of the active arc, for the tooltip to sit beside. */
	const anchor = $derived.by((): VirtualElement | null => {
		if (active === null || !svg) return null;
		const el = svg;
		const { start, draw } = arcs[active];
		const angle = ((start + draw / 2) / c) * 2 * Math.PI - Math.PI / 2;
		const x = size / 2 + r * Math.cos(angle);
		const y = size / 2 + r * Math.sin(angle);
		return {
			contextElement: el,
			getBoundingClientRect() {
				const box = el.getBoundingClientRect();
				const k = box.width / size;
				const left = box.left + x * k;
				const top = box.top + y * k;
				return { x: left, y: top, left, top, right: left, bottom: top, width: 0, height: 0 };
			}
		};
	});

	function step(from: number, by: number): number {
		const n = segments.length;
		for (let i = 1; i <= n; i++) {
			const next = (((from + by * i) % n) + n) % n;
			if (segments[next].value > 0) return next;
		}
		return from;
	}

	function onkeydown(event: KeyboardEvent) {
		if (firstShown < 0) return;
		const at = active ?? firstShown;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			active = step(at, 1);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			active = step(at, -1);
		} else if (event.key === 'Escape' && active !== null) {
			event.stopPropagation();
			active = null;
		}
	}
</script>

<figure class="ds-ring {className}">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (the arrows only show the tooltip; the table holds the values) -->
	<div
		class="plot"
		role="img"
		aria-label={label}
		tabindex={firstShown >= 0 ? 0 : undefined}
		style:width="{size}px"
		style:height="{size}px"
		{onkeydown}
		onfocus={() => (active ??= firstShown >= 0 ? firstShown : null)}
		onblur={() => (active = null)}
	>
		<svg bind:this={svg} viewBox="0 0 {size} {size}" width={size} height={size} aria-hidden="true">
			<g transform="rotate(-90 {size / 2} {size / 2})">
				<circle class="track" cx={size / 2} cy={size / 2} {r} stroke-width={thickness} />
				{#each segments as s, i (i)}
					{#if arcs[i].draw > 0}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<circle
							class="arc"
							cx={size / 2}
							cy={size / 2}
							{r}
							stroke={colors[i]}
							stroke-width={thickness}
							stroke-dasharray="{arcs[i].draw} {c - arcs[i].draw}"
							stroke-dashoffset={-arcs[i].start}
							onpointerenter={() => (active = i)}
							onpointerleave={(e) => e.pointerType === 'mouse' && (active = null)}
						/>
					{/if}
				{/each}
			</g>
		</svg>
		<span class="center" aria-hidden="true" style:inset="{thickness + 4}px">
			{#if center}{@render center()}{:else}
				<span class="value">{centerValue ?? format(total)}</span>
				{#if centerLabel}<span class="caption">{centerLabel}</span>{/if}
			{/if}
		</span>
	</div>
	{#if legend}
		<ul class="legend" aria-hidden="true">
			{#each segments as s, i (i)}
				<li>
					<span class="swatch" style:background={colors[i]}></span>
					<span class="name">{s.label}</span>
					<span class="count">{format(s.value)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	<!-- A table will not shrink to the hidden box, so the box is a div around it. -->
	<div class="ds-sr-only">
		<table>
			<caption>{label}</caption>
			<tbody>
				{#each segments as s, i (i)}
					<tr><th scope="row">{s.label}</th><td>{format(s.value)}</td><td>{percent(s.value)}</td></tr>
				{/each}
				{#if max !== undefined}
					<tr><th scope="row">{strings.total}</th><td>{format(total)}</td><td>{percent(total)}</td></tr>
				{/if}
			</tbody>
		</table>
	</div>
	{#if active !== null && segments[active]}
		{@const s = segments[active]}
		<ChartTip {anchor}>
			<span class="tip-title">{s.label}</span>
			<span class="tip-row"
				><span class="tip-swatch" style:background={colors[active]}></span><span
					>{format(s.value)}</span
				><span>{percent(s.value)}</span></span
			>
		</ChartTip>
	{/if}
</figure>

<style>
	/* The root's margin reset sits in darksite's base layer at zero specificity, so it only clears
	   the browser's figure margin: the page's own rules, such as the article's rhythm, set the
	   space around the block. */
	@layer ds.base {
		:where(.ds-ring) {
			margin: 0;
		}
	}
	.ds-ring {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
		min-width: 0;
	}
	.plot {
		position: relative;
		flex: none;
		border-radius: 50%;
	}
	svg {
		display: block;
	}
	circle {
		fill: none;
	}
	.track {
		stroke: var(--ds-bg-4);
	}
	.arc {
		pointer-events: stroke;
		cursor: default;
	}
	.center {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		overflow: hidden;
		text-align: center;
		pointer-events: none;
	}
	.value {
		color: var(--ds-text-1);
		font-size: var(--ds-text-xl);
		line-height: var(--ds-lh-xl);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.caption {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.legend {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	li {
		display: grid;
		grid-template-columns: 8px minmax(0, auto) auto;
		align-items: center;
		gap: 8px;
	}
	.swatch {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
	.name {
		min-width: 0;
		overflow: hidden;
		color: var(--ds-text-2);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.count {
		color: var(--ds-text-3);
		font-variant-numeric: tabular-nums;
	}
</style>
