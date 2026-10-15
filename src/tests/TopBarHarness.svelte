<script lang="ts">
	import { TopBar } from '#lib';
	let { searchKey = '/' }: { searchKey?: string | null } = $props();
</script>

<TopBar {searchKey}>
	{#snippet search()}<input aria-label="Search records" />{/snippet}
</TopBar>
