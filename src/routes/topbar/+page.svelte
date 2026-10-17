<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { Button, Chip, KeyCap, PageHeader, TopBar } from '#lib';

	const scopes = ['All', 'Open', 'Assigned', 'Blocked', 'Waiting', 'Review', 'Approved', 'Closed'];
	let scope = $state('All');
</script>

<svelte:head><title>TopBar · darksite</title></svelte:head>
<PageHeader title="TopBar" />

{#snippet search()}
	<label class="search">
		<span class="ds-sr-only">Search</span>
		<input class="ds-control" type="search" placeholder="Search records" />
		<KeyCap keys="/" decorative />
	</label>
{/snippet}

<h2>Default</h2>
<div class="frame">
	<TopBar {search}>
		{#snippet start()}<Button variant="ghost" size="dense">All sites</Button>{/snippet}
		{#snippet actions()}<Button variant="primary" size="dense" icon={Plus}>New record</Button
			>{/snippet}
	</TopBar>
</div>

<h2>A row of chips in start</h2>
<p>
	Short of room, <code>start</code> shrinks and scrolls sideways; the actions stay at the end. Drag the
	frame's corner to narrow it.
</p>
<div class="frame resizable">
	<TopBar>
		{#snippet start()}
			{#each scopes as s (s)}<Chip selected={scope === s} onclick={() => (scope = s)}>{s}</Chip
				>{/each}
		{/snippet}
		{#snippet actions()}<Button variant="primary" size="dense" icon={Plus}>New record</Button
			>{/snippet}
	</TopBar>
</div>

<h2>Slim</h2>
<div class="frame">
	<TopBar variant="slim" {search} />
</div>

<style>
	h2 {
		margin: var(--ds-space-6) 0 var(--ds-space-3);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	p {
		max-width: 640px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	.resizable {
		width: 520px;
		max-width: 100%;
		min-width: 240px;
		resize: horizontal;
	}
	.frame {
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
	.search {
		position: relative;
		display: flex;
		align-items: center;
		width: min(360px, 100%);
	}
	.search input {
		width: 100%;
		padding-right: 32px;
	}
	.search :global(.ds-keycap) {
		position: absolute;
		right: 8px;
	}
</style>
