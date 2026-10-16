<!--
@component
ChartTip — internal: the small charts' tooltip. The `tooltip` attachment's bubble look, holding a
title and a few rows, placed beside `anchor` (an element, or a virtual point with a
`contextElement`) in the top layer and kept inside the viewport. It is hidden from assistive
technology: each chart's data table already holds every value.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		autoUpdate,
		computePosition,
		flip,
		offset,
		shift,
		type Placement,
		type VirtualElement
	} from '@floating-ui/dom';

	interface Props {
		anchor: Element | VirtualElement | null;
		placement?: Placement;
		children: Snippet;
	}

	let { anchor, placement = 'top', children }: Props = $props();
	let bubble = $state<HTMLElement>();

	$effect(() => {
		const el = bubble;
		const ref = anchor;
		if (!el || !ref) return;
		if (typeof el.showPopover === 'function' && !el.matches(':popover-open')) el.showPopover();
		const place = () =>
			computePosition(ref, el, {
				placement,
				strategy: 'fixed',
				middleware: [offset(8), flip(), shift({ padding: 8 })]
			}).then(({ x, y }) => {
				el.style.left = `${x}px`;
				el.style.top = `${y}px`;
			});
		const stop = autoUpdate(ref, el, place);
		return () => {
			stop();
			if (typeof el.hidePopover === 'function' && el.matches(':popover-open')) el.hidePopover();
		};
	});
</script>

{#if anchor}
	<div class="ds-tooltip ds-charttip" popover="manual" aria-hidden="true" bind:this={bubble}>
		{@render children()}
	</div>
{/if}

<style>
	.ds-charttip {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px 8px;
		font-variant-numeric: tabular-nums;
	}
	.ds-charttip :global(.tip-title) {
		color: var(--ds-text-1);
		font-weight: 500;
	}
	.ds-charttip :global(.tip-row) {
		display: grid;
		grid-template-columns: 8px minmax(0, 1fr) auto;
		align-items: center;
		gap: 6px 8px;
		color: var(--ds-text-2);
	}
	.ds-charttip :global(.tip-row > :last-child) {
		color: var(--ds-text-1);
		text-align: end;
	}
	.ds-charttip :global(.tip-swatch) {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
</style>
