<!--
@component
Pane — a titled block on a content page: a dashboard section, a block on a detail page.
ds-bg-2 with a subtle edge at ds-radius-md, no shadow.

Header 44px: the title in card-title (14/500), optional `meta`, an optional `tip` (a HelpTip),
and an `end` snippet for one link or one secondary action. The body is unpadded so a Table or list
sits flush — `padded` for prose or a form. An optional `footer` snippet sits under a subtle edge.

Never nest a Pane, and never give it a primary button: the page's primary action lives in
PageHeader.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import HelpTip from './HelpTip.svelte';

	interface Props {
		title: string;
		meta?: string;
		tip?: string;
		level?: 2 | 3 | 4;
		padded?: boolean;
		end?: Snippet;
		footer?: Snippet;
		class?: string;
		children: Snippet;
	}

	let { title, meta, tip, level = 2, padded = false, end, footer, class: className = '', children }: Props =
		$props();
</script>

<section class="ds-pane {className}">
	<header>
		<svelte:element this={`h${level}`} class="title">{title}</svelte:element>
		{#if meta}<span class="meta">{meta}</span>{/if}
		{#if tip}<HelpTip text={tip} placement="bottom" />{/if}
		{#if end}<span class="end">{@render end()}</span>{/if}
	</header>
	<div class="body" data-padded={padded ? '' : undefined}>{@render children()}</div>
	{#if footer}<footer>{@render footer()}</footer>{/if}
</section>

<style>
	.ds-pane {
		--ds-table-bg: var(--ds-bg-2);
		--ds-table-inset: 14px;
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
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		font-weight: 500;
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		white-space: nowrap;
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
