<script lang="ts">
	import { onMount } from 'svelte';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Archive from '@lucide/svelte/icons/archive';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { Button, Menu, type MenuEntry } from '#lib';

	let last = $state('nothing yet');
	let open = $state(false);
	// `?open` opens the menu on load, for screenshots.
	onMount(() => {
		if (new URLSearchParams(location.search).has('open')) open = true;
	});

	const items: MenuEntry[] = [
		{ id: 'edit', label: 'Edit', icon: Pencil, keycap: 'e', onselect: () => (last = 'Edit') },
		{
			id: 'archive',
			label: 'Archive',
			icon: Archive,
			needsNote: true,
			onselect: () => (last = 'Archive')
		},
		{ group: 'Ownership' },
		{
			id: 'transfer',
			label: 'Transfer',
			icon: ArrowRightLeft,
			disabled: true,
			reason: 'Only an owner can transfer this record'
		},
		{ separator: true },
		{
			id: 'delete',
			label: 'Delete…',
			icon: Trash2,
			tone: 'danger',
			onselect: () => (last = 'Delete (opens a Dialog)')
		}
	];
</script>

<svelte:head><title>Menu · darksite</title></svelte:head>
<h1>Menu</h1>
<div class="row">
	<Menu {items} label="Record actions" bind:open>
		{#snippet trigger(attrs)}<Button {...attrs}>Actions</Button>{/snippet}
	</Menu>
	<span class="meta">Last chosen: {last}</span>
</div>
<p>
	↓ / ↑ move, Home / End jump, a letter finds an item, Enter activates, Esc closes. A disabled item
	stays visible with its reason. Under 768px it rises from the bottom as a sheet.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--ds-space-4);
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	p {
		margin-top: var(--ds-space-6);
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		max-width: 60ch;
	}
</style>
