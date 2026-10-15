<script lang="ts">
	import { JustifiedGrid } from '#lib';
	const shapes = [1.5, 0.67, 1, 1.78, 1.33, 0.75, 2.33, 0.8];
	const photos = Array.from({ length: 24 }, (_, i) => ({
		id: i,
		aspect: shapes[i % shapes.length]
	}));
</script>

<div style="width: 900px">
	<JustifiedGrid items={photos} key={(p) => p.id} aspect={(p) => p.aspect} label="Photos">
		{#snippet tile(p)}<div style="background: var(--ds-bg-4)">{p.id}</div>{/snippet}
	</JustifiedGrid>
</div>
