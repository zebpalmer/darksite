<script lang="ts">
	import { Button, Lightbox, type LightboxItem } from '#lib';

	let { inset = 0, keys = false }: { inset?: number | string; keys?: boolean } = $props();
	let open = $state(false);
	let index = $state(0);
	const items: LightboxItem[] = Array.from({ length: 4 }, (_, i) => ({
		src: `/img/${i + 1}.png`,
		alt: `Sample ${i + 1}`
	}));
</script>

<Button onclick={() => (open = true)}>Open viewer</Button>
<p data-testid="index">{index}</p>
<Lightbox {items} bind:open bind:index {inset} {keys} />
