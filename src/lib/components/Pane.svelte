<!--
@component
Pane — a titled block on a content page: a dashboard section, a block on a detail page.
ds-bg-2 with a subtle edge at ds-radius-md, no shadow.

Header 44px: the title in card-title (14/500), optional `meta`, an optional `tip` (a HelpTip;
`tipLabel` names its button), and an `end` snippet for one link or one secondary action. The body
is unpadded so a Table, a list or a FactList sits at the pane's 14px inset — `padded` for prose or
a form. An optional `footer` snippet sits under a subtle edge.

`collapsible` makes the title a disclosure button (`aria-expanded`, a chevron) that shows and
hides the body and footer; `open` is bindable. `collapseBelow` starts it collapsed when the pane
itself is narrower than that many pixels when it mounts (its own width, not the viewport).

Never nest a Pane, and never give it a primary button: the page's primary action lives in
PageHeader.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import HelpTip from './HelpTip.svelte';

	interface Props {
		title: string;
		meta?: string;
		tip?: string;
		/** The tip button's accessible name (HelpTip `label`; default "More information"). */
		tipLabel?: string;
		level?: 2 | 3 | 4;
		padded?: boolean;
		/** The title becomes a disclosure button that shows and hides the body. */
		collapsible?: boolean;
		/** Whether a collapsible pane's body is shown. */
		open?: boolean;
		/** Start collapsed when the pane is narrower than this (px) as it mounts. */
		collapseBelow?: number;
		end?: Snippet;
		footer?: Snippet;
		class?: string;
		children: Snippet;
	}

	let {
		title,
		meta,
		tip,
		tipLabel,
		level = 2,
		padded = false,
		collapsible = false,
		open = $bindable(true),
		collapseBelow,
		end,
		footer,
		class: className = '',
		children
	}: Props = $props();

	const uid = $props.id();
	const shown = $derived(!collapsible || open);

	// Once, as the pane mounts: a later toggle by the viewer is never overridden.
	function measure(el: HTMLElement) {
		untrack(() => {
			const w = el.clientWidth;
			if (collapsible && collapseBelow !== undefined && w > 0 && w < collapseBelow) open = false;
		});
	}
</script>

<section
	class="ds-pane {className}"
	data-collapsible={collapsible ? '' : undefined}
	data-open={shown ? '' : undefined}
	{@attach measure}
>
	<header>
		{#if collapsible}
			<svelte:element this={`h${level}`} class="title">
				<button
					type="button"
					class="toggle"
					aria-expanded={open}
					aria-controls="{uid}-body"
					onclick={() => (open = !open)}
				>
					<ChevronRight size={16} aria-hidden="true" class="chevron" />
					<span class="text">{title}</span>
					{#if meta}<span class="meta">{meta}</span>{/if}
				</button>
			</svelte:element>
		{:else}
			<svelte:element this={`h${level}`} class="title">{title}</svelte:element>
			{#if meta}<span class="meta">{meta}</span>{/if}
		{/if}
		{#if tip}<HelpTip text={tip} label={tipLabel} placement="bottom" />{/if}
		{#if end}<span class="end">{@render end()}</span>{/if}
	</header>
	<div id="{uid}-body" class="body" data-padded={padded ? '' : undefined} hidden={!shown}>
		{@render children()}
	</div>
	{#if footer}<footer hidden={!shown}>{@render footer()}</footer>{/if}
</section>

<style>
	.ds-pane {
		--ds-table-bg: var(--ds-bg-2);
		--ds-table-inset: 14px;
		--ds-facts-inset: 14px;
		--ds-facts-inset-block: 8px;
		display: flex;
		flex-direction: column;
		min-width: 0;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 14px;
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	.title {
		margin: 0;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--ds-text-heading);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		font-weight: 500;
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		white-space: nowrap;
	}
	[data-collapsible] .title {
		display: flex;
		overflow: visible;
	}
	[data-collapsible]:not([data-open]) header {
		border-bottom: 0;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 100%;
		min-height: 32px;
		margin: 0 -6px;
		padding: 0 6px;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.toggle {
			min-height: var(--ds-h-touch);
		}
	}
	.toggle:focus-visible {
		outline-offset: -2px;
	}
	.toggle:hover {
		background: var(--ds-bg-3);
	}
	.toggle .text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.toggle :global(.chevron) {
		flex: none;
		color: var(--ds-text-3);
		transition: transform var(--ds-dur-fast) var(--ds-ease-out);
	}
	.toggle[aria-expanded='true'] :global(.chevron) {
		transform: rotate(90deg);
	}
	.toggle .meta {
		font-weight: 400;
	}
	[hidden] {
		display: none !important;
	}
	.end {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}
	.body {
		min-width: 0;
	}
	.body[data-padded] {
		--ds-facts-inset: 0px;
		--ds-facts-inset-block: 0px;
		padding: 14px;
	}
	footer {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 40px;
		padding: 0 14px;
		border-top: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
</style>
