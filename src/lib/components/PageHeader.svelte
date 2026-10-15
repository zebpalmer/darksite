<!--
@component
PageHeader — the top of a page: 56px, the title (20/500), a count, optional content after the
title (usually Tabs), and right-aligned actions. A ds-border-subtle bottom edge on ds-bg-1. No
breadcrumbs, no hero.

Always flush: it cancels the shell's padded column (`--ds-pad-top` / `--ds-pad-x`) with negative
margins, so every page gets the same bar, the same full-width edge and the same 20px title inset.
Put it first on the page. The title keeps its width; the count gives way on a narrow header.

- `title`, `count` (a number is localized; or text such as "38 this week"), `level` (default 1),
  `actions` snippet, `sticky`, children (inline after the title), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count?: number | string | null;
		level?: 1 | 2;
		actions?: Snippet;
		sticky?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { title, count = null, level = 1, actions, sticky = false, class: className = '', children }: Props = $props();

	const countText = $derived(typeof count === 'number' ? count.toLocaleString() : count);
</script>

<header class="ds-pageheader {className}" class:sticky>
	<div class="lead">
		<svelte:element this={`h${level}`} class="title">{title}</svelte:element>
		{#if countText !== null && countText !== undefined}<span class="count">{countText}</span>{/if}
		{@render children?.()}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.ds-pageheader {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: var(--ds-header-h);
		margin: calc(-1 * var(--ds-pad-top, 0px)) calc(-1 * var(--ds-pad-x, 0px)) var(--ds-pad-top, 0px);
		padding: 0 16px;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-1);
	}
	@media (min-width: 768px) {
		.ds-pageheader {
			padding: 0 24px 0 20px;
		}
	}
	.sticky {
		position: sticky;
		top: var(--ds-topbar-sticky, 0px);
		z-index: var(--ds-z-sticky);
	}
	.lead {
		display: flex;
		align-items: center;
		align-self: stretch;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}
	.title {
		flex: none;
		max-width: 100%;
		margin: 0;
		overflow: hidden;
		color: var(--ds-text-1);
		font-size: var(--ds-text-xl);
		line-height: var(--ds-lh-xl);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.count {
		flex: 0 1 auto;
		min-width: 0;
		overflow: hidden;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}
</style>
