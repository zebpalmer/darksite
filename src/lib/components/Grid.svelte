<!--
@component
Grid — the card grid. Container-driven, never viewport breakpoints: it adds columns as its pane
widens and never stretches a card past its L width.

`density` s / m / l is a card min-width of 180 / 232 / 320px. Without it the grid reads
`--ds-grid-min` (232px by default), so an app sets the viewer's density preference once, on the
root. A thumbnail grid narrower than 520px goes 2-up; a grid with an explicit `min` of 260 or more
is a row grid (EntityCard) and keeps its min, one per line.

- `density`, `min` (px, overrides density), `gap` (CSS, default `18px 14px`), `label`, `class`,
  `data-*` passthrough, children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		density?: 's' | 'm' | 'l';
		min?: number;
		gap?: string;
		label?: string;
		class?: string;
		children: Snippet;
		[key: `data-${string}`]: unknown;
	}

	let { density, min, gap = '18px 14px', label, class: className = '', children, ...rest }: Props =
		$props();

	const MIN = { s: 180, m: 232, l: 320 };
	const cardMin = $derived(
		min !== undefined ? `${min}px` : density ? `${MIN[density]}px` : 'var(--ds-grid-min, 232px)'
	);
</script>

<div class="ds-grid-wrap {className}">
	<div
		class="ds-grid"
		data-rows={min !== undefined && min >= 260 ? '' : undefined}
		style:--card-min={cardMin}
		style:gap
		role={label ? 'group' : undefined}
		aria-label={label}
		{...rest}
	>
		{@render children()}
	</div>
</div>

<style>
	.ds-grid-wrap {
		container-type: inline-size;
		min-width: 0;
	}
	.ds-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(var(--card-min), 100%), 1fr));
	}
	@container (max-width: 519.98px) {
		.ds-grid:not([data-rows]) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
