<script lang="ts">
	import { Button, Lightbox, type LightboxItem } from '#lib';

	let {
		index = $bindable(0),
		open = $bindable(false),
		loop = false
	}: { index?: number; open?: boolean; loop?: boolean } = $props();
	const items: LightboxItem[] = Array.from({ length: 12 }, (_, i) => ({
		src: `/img/${i + 1}.png`,
		alt: `Sample ${i + 1}`,
		width: 1200,
		height: 800
	}));
</script>

<Button onclick={() => (open = true)}>Open viewer</Button>
<p data-testid="index">{index}</p>
<Lightbox {items} bind:open bind:index {loop}>
	{#snippet caption(item)}Caption for {item.alt}{/snippet}
	{#snippet actions()}<Button size="dense">Download</Button>{/snippet}
</Lightbox>
