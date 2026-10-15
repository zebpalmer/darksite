<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { Button, KeyCap, PageHeader, TopBar } from '#lib';
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
