<!--
@component
ActionBar — one row of actions fixed to the bottom of its pane: 56px (64 on touch), ds-bg-2, a
ds-border top edge. It never overlaps content: it is the pane's last, non-scrolling child. With
`sticky` it is a page-level bar that sticks above the phone tab bar instead.

Primary action right-most; a `<span class="grow"></span>` splits the left and right groups and a
`<span class="divider"></span>` separates clusters. While mounted it publishes its height as
`--ds-actionbar-space`, so toasts stack above it.

- `sticky`, `label` (the group's name, default "Actions"), `class`, children.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';

	let { sticky = false, label = strings.actions, class: className = '', children }: {
		sticky?: boolean;
		label?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	let el: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!el) return;
		const root = document.documentElement;
		const publish = () => root.style.setProperty('--ds-actionbar-space', `${el!.offsetHeight}px`);
		publish();
		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
		ro?.observe(el);
		return () => {
			ro?.disconnect();
			root.style.removeProperty('--ds-actionbar-space');
		};
	});
</script>

<div bind:this={el} class="ds-actionbar {className}" class:sticky role="group" aria-label={label}>
	{@render children?.()}
</div>

<style>
	.ds-actionbar {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-width: 0;
		height: 56px;
		padding: 0 12px;
		border-top: 1px solid var(--ds-border);
		background: var(--ds-bg-2);
	}
	@media (pointer: coarse) {
		.ds-actionbar {
			height: 64px;
		}
	}
	.sticky {
		position: sticky;
		bottom: var(--ds-chrome-bottom);
		z-index: var(--ds-z-sticky);
	}
	.ds-actionbar :global(.grow) {
		flex: 1;
	}
	.ds-actionbar :global(.divider) {
		width: 1px;
		height: 24px;
		background: var(--ds-border);
	}
</style>
