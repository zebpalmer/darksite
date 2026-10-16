<!--
@component
CellBar — a number with a bar, inside a Table cell: how each row compares with the largest, read
down the column. A 6px `ds-bg-4` track filling the cell, a categorical bar from its start, and the
value beside it in tabular figures. The value is the text a screen reader and the table hear; the
bar is drawn for the eye, and its tooltip says "312 of 1,240".

- `value`, `max` (the column's scale: usually its largest value, the same for every row), `tone`
  (a categorical color: `1`–`5` or `'accent-2'`; default 1), `format(value)`, `showValue` (default
  true; when false the value is still read), `valueWidth` (CSS, default `6ch`, so the bars line up
  down a column), `class`.

Give the column `align: 'end'` and a width. One CellBar column per table at most.
-->
<script lang="ts">
	import { chartColor, type ChartTone } from '../chart.js';
	import { tooltip } from '../tooltip.js';

	interface Props {
		value: number;
		max: number;
		tone?: ChartTone;
		format?: (value: number) => string;
		showValue?: boolean;
		valueWidth?: string;
		class?: string;
	}

	let {
		value,
		max,
		tone = 1,
		format = (v: number) => v.toLocaleString(),
		showValue = true,
		valueWidth = '6ch',
		class: className = ''
	}: Props = $props();

	const share = $derived(max > 0 ? Math.min(1, Math.max(0, value / max)) : 0);
</script>

<span class="ds-cellbar {className}" {@attach tooltip(`${format(value)} of ${format(max)}`)}>
	<span class="track" aria-hidden="true">
		{#if share > 0}<span
				class="bar"
				style:width="{share * 100}%"
				style:background={chartColor(tone, 0)}
			></span>{/if}
	</span>
	<span class={showValue ? 'value' : 'ds-sr-only'} style:min-width={valueWidth}>{format(value)}</span>
</span>

<style>
	.ds-cellbar {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-width: 0;
	}
	.track {
		display: block;
		flex: 1;
		min-width: 24px;
		height: 6px;
		overflow: hidden;
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-4);
	}
	.bar {
		display: block;
		min-width: 2px;
		height: 100%;
		border-radius: inherit;
	}
	.value {
		flex: none;
		font-variant-numeric: tabular-nums;
		text-align: end;
	}
</style>
