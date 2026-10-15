<!--
@component
TopBar — a strip above the content column for what belongs to every page of a section: search, a
global create action, a scope that outlives the page. 48px on ds-bg-2, or `variant="slim"` (40px
on ds-bg-1) where it only carries search. It sits outside the padded column, so PageHeader keeps
its flush geometry underneath, and publishes its height as `--ds-topbar-h`.

- `start` snippet (a scope selector), `search` snippet (usually an Input with a `/` key cap),
  `actions` snippet, `variant`, `sticky`, `label`, `searchKey` (default `/`: focuses the first
  field in `search`, unless the user is typing or the page already handled the key; `null` hands
  the key to the page).

If a control is not relevant on every page of the section, it belongs in that page's PageHeader.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isTypingTarget, matchesKey } from '../keycap.js';

	interface Props {
		start?: Snippet;
		search?: Snippet;
		actions?: Snippet;
		variant?: 'default' | 'slim';
		sticky?: boolean;
		label?: string;
		searchKey?: string | null;
		class?: string;
	}

	let { start, search, actions, variant = 'default', sticky = false, label = 'Toolbar', searchKey = '/', class: className = '' }: Props =
		$props();

	let el: HTMLElement | undefined = $state();
	let searchEl: HTMLElement | undefined = $state();

	function onkeydown(event: KeyboardEvent) {
		if (!searchKey || event.defaultPrevented || isTypingTarget(event.target)) return;
		if (!matchesKey(event, searchKey)) return;
		const field = searchEl?.querySelector<HTMLElement>('input, select, textarea, [contenteditable="true"]');
		if (!field) return;
		event.preventDefault();
		field.focus();
	}

	$effect(() => {
		if (!el) return;
		const root = document.documentElement;
		const publish = () => root.style.setProperty('--ds-topbar-h', `${el!.offsetHeight}px`);
		publish();
		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
		ro?.observe(el);
		return () => {
			ro?.disconnect();
			root.style.removeProperty('--ds-topbar-h');
		};
	});
</script>

<svelte:window {onkeydown} />

<div bind:this={el} class="ds-topbar {className}" data-variant={variant} class:sticky role="region" aria-label={label}>
	{#if start}<div class="start">{@render start()}</div>{/if}
	{#if search}<div class="search" bind:this={searchEl}>{@render search()}</div>{/if}
	<span class="grow"></span>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	.ds-topbar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: none;
		min-height: 48px;
		padding: 0 16px;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
	}
	.ds-topbar[data-variant='slim'] {
		min-height: 40px;
		background: var(--ds-bg-1);
	}
	.sticky {
		position: sticky;
		top: 0;
		z-index: 21;
	}
	.start,
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}
	.search {
		flex: 1;
		min-width: 0;
		max-width: 360px;
	}
	.grow {
		flex: 1;
	}
	@media (max-width: 767.98px) {
		.ds-topbar {
			padding: 0 12px;
		}
		.search {
			max-width: none;
		}
		.grow {
			display: none;
		}
	}
</style>
