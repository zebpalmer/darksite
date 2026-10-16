<!--
@component
TopBar — a strip above the content column for what belongs to every page of a section: search, a
global create action, a scope that outlives the page. 48px on ds-bg-2, or `variant="slim"` (40px
on ds-bg-1) where it only carries search. It sits outside the padded column, so PageHeader keeps
its flush geometry underneath, and publishes its height as `--ds-topbar-h`.

- `start` snippet (a scope selector), `search` snippet (usually an Input with a `/` key cap),
  `actions` snippet, `variant`, `sticky`, `label`, `searchKey` (default `/`: focuses the first
  field in `search`, unless the user is typing or the page already handled the key; `null` hands
  the key to the page). The key is the `focusShortcut` attachment, exported for other containers.

If a control is not relevant on every page of the section, it belongs in that page's PageHeader.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { focusShortcut } from '../hotkeys.js';

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

	let { start, search, actions, variant = 'default', sticky = false, label = strings.toolbar, searchKey = '/', class: className = '' }: Props =
		$props();

	let el: HTMLElement | undefined = $state();

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

<div bind:this={el} class="ds-topbar {className}" data-variant={variant} class:sticky role="region" aria-label={label}>
	{#if start}<div class="start">{@render start()}</div>{/if}
	{#if search}<div class="search" {@attach focusShortcut(searchKey)}>{@render search()}</div>{/if}
	<span class="grow"></span>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	.ds-topbar {
		/* The bar reads the chrome roles, so a brand can color it: everything inside — buttons,
		   fields, tooltips — follows. By default they are the page's own roles. */
		--ds-bg-0: var(--ds-bar-bg-0);
		--ds-bg-1: var(--ds-bar-bg-1);
		--ds-bg-2: var(--ds-bar-bg-2);
		--ds-bg-3: var(--ds-bar-bg-3);
		--ds-bg-4: var(--ds-bar-bg-4);
		--ds-bg-5: var(--ds-bar-bg-5);
		--ds-text-1: var(--ds-bar-text-1);
		--ds-text-2: var(--ds-bar-text-2);
		--ds-text-3: var(--ds-bar-text-3);
		--ds-border-subtle: var(--ds-bar-border-subtle);
		--ds-border: var(--ds-bar-border);
		--ds-border-strong: var(--ds-bar-border-strong);
		--ds-accent: var(--ds-bar-accent);
		--ds-accent-text: var(--ds-bar-accent-text);
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
		z-index: var(--ds-z-topbar);
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
