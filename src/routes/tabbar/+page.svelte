<script lang="ts">
	import { Button, PageHeader } from '#lib';
	import { demo } from '../demo.svelte.js';

	function setBadge(value: number | boolean | null) {
		demo.badges = { ...demo.badges, sidenav: value };
	}
</script>

<svelte:head><title>TabBar · darksite</title></svelte:head>
<PageHeader title="TabBar" />
<p>
	Narrow the window below 768px. The rail gives way to four tabs and More; More opens a sheet with
	the rest of the list, grouped, and the account footer. A badge on an item behind More shows as a
	dot on More.
</p>
<div class="row">
	<Button onclick={() => setBadge(5)}>Badge SideNav (behind More)</Button>
	<Button variant="ghost" onclick={() => setBadge(null)}>Clear</Button>
</div>

<style>
	p {
		max-width: 640px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ds-space-2);
	}
</style>
