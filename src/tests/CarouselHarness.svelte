<script lang="ts">
	import { Carousel } from '#lib';

	interface Props {
		count?: number;
		loading?: boolean;
		href?: string;
		withEmpty?: boolean;
		plain?: boolean;
	}
	let { count = 4, loading = false, href, withEmpty = false, plain = false }: Props = $props();
	const items = $derived(
		Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i + 1}` }))
	);
</script>

{#snippet emptyRow()}Nothing here yet{/snippet}

<Carousel
	{items}
	key={(i) => i.id}
	title="Recent"
	{count}
	{href}
	{loading}
	empty={withEmpty ? emptyRow : undefined}
>
	{#snippet tile(item)}
		{#if plain}<span>{item.name}</span>{:else}<a href="#{item.id}">{item.name}</a>{/if}
	{/snippet}
</Carousel>
