<script lang="ts" module>
	/** One stop's count in a Stat's meta line: "High 2". */
	export interface StatLevel<V extends string = string> {
		level: V;
		value: number | string;
	}
</script>

<!--
@component
Stat — a headline number: a label, the value (24/500, tabular), an optional unit or "of N", and
one meta line that breaks the number down. ds-bg-2 with a subtle edge; no shadow, no icon.

- `label`, `value` (a number is localized; `null`, `undefined` or `''` shows the Missing mark,
  without the unit), `unit`, `of` (renders "of N"), `missing` (the mark), `meta` (text or a
  snippet — one line, never a sentence), `href` (the whole tile becomes a link), `severity` (a 3px
  leading stripe and a SeverityBadge in the meta line), `variant` (`default` | `headline`: the
  value at 28px and the one weight above 500, with the label under it — a public page's key
  figures).
- `scale` + `level`: a stop on an app's own scale (`defineScale`), shown the way a severity is —
  the stop's 3px leading stripe (dashed for the scale's unknown stop) and a ScaleBadge in the meta
  line. Leave `value` out and the stop's name is the value ("Status: Good"), with no badge. A level
  that is unset or not on the scale shows no stripe and no badge. `severity` wins over a level.
  These two are the only ways to color a Stat.
- `scale` + `levels`: a breakdown by stop — `{ level, value }[]`, each a ScaleBadge with its count
  in the meta line ("Medium 2 · Critical 4"), in scale order (unknown last), wrapping onto a second
  line in a narrow tile rather than hiding a count. They replace the meta line's single badge;
  the stripe still comes from `severity` or `level` alone (pass `scale.highest(…)` for the worst).
  A `meta` follows them as the last entry. Pass `severityScale` to count severities.

Put several in a StatRow (`max={5}` for a row of five).
-->
<script lang="ts" generics="V extends string = string">
	import type { Snippet } from 'svelte';
	import Missing from './Missing.svelte';
	import ScaleBadge from './ScaleBadge.svelte';
	import SeverityBadge from './SeverityBadge.svelte';
	import type { Scale } from '../scale.js';
	import { severityVars, type Severity } from '../severity.js';

	interface Props {
		label: string;
		/** `null`, `undefined` or `''` shows the Missing mark. Left out beside a `level`, the stop's
		 *  name is the value. */
		value?: number | string | null;
		unit?: string;
		of?: number | string;
		/** What a missing value shows. */
		missing?: string;
		meta?: string | Snippet;
		href?: string;
		severity?: Severity | null;
		/** An app's own ordered scale, from `defineScale`, that `level` is a stop on. */
		scale?: Scale<V>;
		/** A stop on `scale`: its leading stripe, and a ScaleBadge beside a value. */
		level?: V | null;
		/** A count per stop on `scale`, shown in the meta line in scale order. */
		levels?: readonly StatLevel<V>[];
		/** `headline`: a bigger, heavier value with the label under it. */
		variant?: 'default' | 'headline';
		class?: string;
	}

	let {
		label,
		value,
		unit,
		of,
		missing = '—',
		meta,
		href,
		severity = null,
		scale,
		level = null,
		levels,
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString() : v);
	// A level on the scale, unless a severity already colors the tile.
	const stop = $derived(!severity && scale ? scale.stop(level) : null);
	// Without a value of its own, the tile's value is the stop's name.
	const named = $derived(!!stop && value === undefined);
	const absent = $derived(!named && (value === null || value === undefined || value === ''));
	const mark = $derived(severity ? severityVars(severity).mark : stop?.mark);
	const shown = $derived(named ? stop!.label : absent ? '' : fmt(value as number | string));
	// The breakdown: the entries on the scale, in its order, with the unknown stop last.
	const counts = $derived.by(() => {
		if (!scale || !levels) return [];
		const at = (v: V) => (scale.isUnknown(v) ? Infinity : scale.rank(v));
		return levels.filter((l) => scale.has(l.level)).sort((a, b) => at(a.level) - at(b.level));
	});
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class="ds-stat {className}"
	data-severity={severity ?? undefined}
	data-level={stop?.value}
	data-unknown={stop && scale?.isUnknown(stop.value) ? '' : undefined}
	data-variant={variant}
	style:--mark={mark}
>
	<span class="label">{label}</span>
	<span class="figure">
		<span class="value"
			>{#if absent}<Missing mark={missing} />{:else}{shown}{/if}</span
		>
		{#if unit && !absent}<span class="unit">{unit}</span>{/if}
		{#if of !== undefined}<span class="unit">of {fmt(of)}</span>{/if}
	</span>
	{#if counts.length && scale}
		<span class="meta">
			<!-- Each line's first separator sits in the clipped gutter, so a wrapped line starts clean. -->
			<span class="levels"
				><span class="entries">
					{#each counts as c, i (i)}
						<span class="entry"
							><ScaleBadge {scale} value={c.level} size="sm" /><span class="count">{fmt(c.value)}</span
							></span
						>
					{/each}
					{#if meta}
						<span class="entry rest"
							>{#if typeof meta === 'function'}{@render meta()}{:else}<span class="text">{meta}</span
								>{/if}</span
						>
					{/if}
				</span></span
			>
		</span>
	{:else if meta || severity || (stop && !named)}
		<span class="meta">
			{#if severity}<SeverityBadge {severity} size="sm" />{:else if stop && scale && !named}<ScaleBadge
					{scale}
					value={stop.value}
					size="sm"
				/>{/if}
			{#if typeof meta === 'function'}{@render meta()}{:else if meta}<span class="text">{meta}</span>{/if}
		</span>
	{/if}
</svelte:element>

<style>
	.ds-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		padding: 12px 14px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
		text-decoration: none;
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-stat[data-severity],
	.ds-stat[data-level] {
		box-shadow: inset 3px 0 0 var(--mark);
		padding-left: 17px;
	}
	/* The scale's unknown stop: a dashed stripe, so it never reads as a position on the scale. */
	.ds-stat[data-unknown] {
		position: relative;
		overflow: hidden;
		box-shadow: none;
	}
	.ds-stat[data-unknown]::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 3px;
		background: repeating-linear-gradient(to bottom, var(--mark) 0 3px, transparent 3px 6px);
	}
	a.ds-stat:hover {
		background: var(--ds-bg-3);
	}
	.label {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.figure {
		display: flex;
		align-items: baseline;
		gap: 6px;
		min-width: 0;
	}
	.value {
		font-size: var(--ds-text-2xl);
		line-height: var(--ds-lh-2xl);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		white-space: nowrap;
	}
	/* Headline: the figure first and heavier, the label under it. The label stays first in the
	   markup, so it is still read before the number. The weight is the headline-number role, the
	   one step above 500. */
	[data-variant='headline'] .figure {
		order: -1;
	}
	[data-variant='headline'] .value {
		font-size: 28px;
		line-height: 34px;
		font-weight: 650;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		margin-top: 2px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	/* A breakdown by level. The entries wrap; each starts with a dot in a 15px gutter, and the row is
	   pulled 15px left inside a clipping box, so the first entry on every line loses its dot. */
	.levels {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
	}
	.entries {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		row-gap: 4px;
		margin-left: -15px;
	}
	.entry {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-width: 0;
		padding-left: 15px;
		white-space: nowrap;
	}
	.entry::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 6px;
		width: 3px;
		height: 3px;
		margin-top: -1.5px;
		border-radius: 50%;
		background: currentColor;
	}
	.count {
		color: var(--ds-text-2);
		font-variant-numeric: tabular-nums;
	}
	.rest {
		flex: 0 1 auto;
		overflow: hidden;
	}
	.text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
