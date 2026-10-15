<!--
@component
WorkView — the work-view frame (docs/layout.md): a PageHeader on top, an optional rail beside the
results (a FilterRail, a queue), the results scrolling on their own, and an ActionBar pinned under
them. It sizes itself; no page computes heights or cancels padding.

Inside AppShell it takes over the content column: from 768px the shell locks to the viewport, its
padding drops to zero (so the PageHeader is flush without negative margins), and the frame fills
what the Banner and TopBar leave — whatever their heights. A Table that is the body's direct child
becomes its scroller, so its header sticks. Below 768px the document scrolls instead: the rail is
the FilterRail's own Filters button, the results flow, and the footer sticks above the tab bar.
That switch is the shell's (the viewport, at `ds-bp-phone`), the same one FilterRail makes.

Outside AppShell, give it a height with `--ds-workview-h` or a flex parent.

- `header` snippet (a PageHeader), `rail` snippet (a FilterRail), `top` snippet (above the
  results, not scrolling: ActiveFilters, a Banner for this view), children (the results: a Table,
  a Grid, a list), `footer` snippet (an ActionBar), `label` (names the results region), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header?: Snippet;
		rail?: Snippet;
		top?: Snippet;
		footer?: Snippet;
		/** Names the results region for assistive technology. */
		label?: string;
		class?: string;
		children: Snippet;
	}

	let { header, rail, top, footer, label, class: className = '', children }: Props = $props();
</script>

<div class="ds-workview {className}">
	{#if header}<div class="head">{@render header()}</div>{/if}
	<div class="frame">
		{#if rail}<div class="rail">{@render rail()}</div>{/if}
		<div class="results">
			{#if top}<div class="top">{@render top()}</div>{/if}
			<div class="body" role={label ? 'region' : undefined} aria-label={label}>
				{@render children()}
			</div>
			{#if footer}<div class="foot">{@render footer()}</div>{/if}
		</div>
	</div>
</div>

<style>
	.ds-workview {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		min-height: 0;
		height: var(--ds-workview-h, auto);
		background: var(--ds-bg-1);
	}
	.head {
		flex: none;
		min-width: 0;
	}
	.frame {
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
	}
	.rail {
		display: flex;
		flex: none;
		min-height: 0;
	}
	.results {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		min-height: 0;
	}
	.top {
		flex: none;
		min-width: 0;
		padding: 10px 12px 0;
	}
	.top:empty {
		display: none;
	}
	/* The one scroller: a Table placed straight in the body takes the scroll, so its header sticks. */
	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		min-height: 0;
		overflow: auto;
	}
	.body > :global(.ds-table) {
		flex: 1;
		min-height: 0;
	}
	.foot {
		flex: none;
		min-width: 0;
	}
	@media (max-width: 767.98px) {
		.ds-workview {
			height: auto;
		}
		.frame {
			flex-direction: column;
		}
		.rail {
			padding: 10px 16px 0;
		}
		.top {
			padding: 10px 16px 0;
		}
		.body {
			overflow: visible;
		}
		.foot {
			position: sticky;
			bottom: var(--ds-chrome-bottom, 0px);
			z-index: var(--ds-z-sticky);
		}
	}
</style>
