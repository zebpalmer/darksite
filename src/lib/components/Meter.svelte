<script lang="ts" module>
	export interface MeterSegment {
		label: string;
		value: number;
		/** A categorical series (`1`–`5`, the default by position) or a semantic tone. */
		tone?: 1 | 2 | 3 | 4 | 5 | 'success' | 'warning' | 'danger' | 'accent';
	}
</script>

<!--
@component
Meter — a determinate proportion: a 6px ds-bg-4 track with rounded ends holding up to three
segments, and an optional legend (an 8px swatch, the label and the count, 12px).

Segments take the categorical palette by position (`ds-cat-1`, `-2`, `-3`), or a semantic `tone`
when the segment means one — success for "done". A 2px gap of track separates segments, so they
never rely on color alone, and the legend always names them.

- `segments`, `max` (default: the sum), `label` (the accessible name), `kind` (`meter` |
  `progress`), `legend` (default true).

Not for loading — that is a Spinner or a SkeletonLoader. More than three segments is a chart.
-->
<script lang="ts">
	interface Props {
		segments: readonly MeterSegment[];
		label: string;
		max?: number;
		kind?: 'meter' | 'progress';
		legend?: boolean;
		class?: string;
	}

	let { segments, label, max, kind = 'meter', legend = true, class: className = '' }: Props = $props();

	const total = $derived(segments.reduce((sum, s) => sum + Math.max(0, s.value), 0));
	const scale = $derived(Math.max(max ?? total, total, 0));
	const color = (s: MeterSegment, i: number) => {
		const tone = s.tone ?? ((i % 5) + 1);
		return typeof tone === 'number' ? `var(--ds-cat-${tone})` : `var(--ds-${tone})`;
	};
	const valuetext = $derived(
		segments.map((s) => `${s.label} ${s.value.toLocaleString()}`).join(', ') +
			(max !== undefined ? ` of ${max.toLocaleString()}` : '')
	);
</script>

<div class="ds-meter {className}">
	<div
		class="track"
		role={kind === 'progress' ? 'progressbar' : 'meter'}
		aria-label={label}
		aria-valuemin={0}
		aria-valuemax={scale}
		aria-valuenow={total}
		aria-valuetext={valuetext}
	>
		{#each segments as segment, i (i)}
			{#if segment.value > 0 && scale > 0}
				<span class="seg" style:width="{(segment.value / scale) * 100}%" style:background={color(segment, i)}></span>
			{/if}
		{/each}
	</div>
	{#if legend}
		<ul class="legend" aria-hidden="true">
			{#each segments as segment, i (i)}
				<li>
					<span class="swatch" style:background={color(segment, i)}></span>
					<span class="name">{segment.label}</span>
					<span class="count">{segment.value.toLocaleString()}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.ds-meter {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}
	.track {
		display: flex;
		gap: 2px;
		height: 6px;
		overflow: hidden;
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-4);
	}
	.seg {
		/* Shrinks with its siblings so the 2px gaps never push the last segment out. */
		flex: 0 1 auto;
		height: 100%;
		min-width: 2px;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		margin: 0;
		padding: 0;
		list-style: none;
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
	.name {
		color: var(--ds-text-2);
	}
	.count {
		color: var(--ds-text-3);
		font-variant-numeric: tabular-nums;
	}
</style>
