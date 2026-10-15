<script lang="ts">
	import { topmost } from '#lib';
	let { show = true }: { show?: boolean } = $props();
</script>

<main>
	{#if show}
		<div class="home"><p class="notice" {@attach topmost}>Update available</p></div>
	{/if}
</main>
