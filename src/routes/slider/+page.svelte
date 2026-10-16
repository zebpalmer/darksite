<script lang="ts">
	import { Field, PageHeader, Slider } from '#lib';

	let threshold = $state(40);
	let zoom = $state(1);
	let detail = $state(2);
	const levels = ['Least', 'Less', 'Normal', 'More', 'Most'];
</script>

<svelte:head><title>Slider · darksite</title></svelte:head>
<PageHeader title="Slider" />
<div class="demo">
	<div class="stack">
		<Field label="Threshold" help="Records above it are flagged.">
			{#snippet children(f)}
				<Slider
					id={f.id}
					describedBy={f.describedBy}
					invalid={f.invalid}
					bind:value={threshold}
					showValue
				/>
			{/snippet}
		</Field>
		<Field label="Zoom">
			{#snippet children(f)}
				<Slider
					id={f.id}
					describedBy={f.describedBy}
					invalid={f.invalid}
					bind:value={zoom}
					min={0.5}
					max={2}
					step={0.25}
					ticks={[0.5, 1, 1.5, 2]}
					format={(v) => `${v}×`}
					showValue
				/>
			{/snippet}
		</Field>
		<Field label="Detail">
			{#snippet children(f)}
				<Slider
					id={f.id}
					describedBy={f.describedBy}
					invalid={f.invalid}
					bind:value={detail}
					min={0}
					max={4}
					ticks={levels.map((label, value) => ({ value, label }))}
					format={(v) => levels[v]}
				/>
			{/snippet}
		</Field>
		<Slider label="Disabled" value={60} disabled />
	</div>
	<p class="out">threshold={threshold} zoom={zoom} detail={levels[detail]}</p>
</div>
