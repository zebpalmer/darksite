<script lang="ts">
	import { FullBleed, Pane } from '#lib';
</script>

<svelte:head><title>Full-bleed page · darksite</title></svelte:head>
<FullBleed label="Map">
	<div class="canvas" aria-hidden="true"></div>
	<div class="overlay">
		<Pane title="Legend" padded>
			<p class="note">A full-bleed page fills the column at every width. Panels float over it.</p>
		</Pane>
	</div>
</FullBleed>

<style>
	.canvas {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 30% 40%, var(--ds-accent-tint) 0 8%, transparent 9%),
			radial-gradient(circle at 65% 60%, var(--ds-accent-2-tint) 0 10%, transparent 11%),
			repeating-linear-gradient(0deg, var(--ds-bg-2) 0 1px, transparent 1px 48px),
			repeating-linear-gradient(90deg, var(--ds-bg-2) 0 1px, transparent 1px 48px), var(--ds-bg-1);
	}
	.overlay {
		position: absolute;
		top: 16px;
		right: 16px;
		width: min(280px, calc(100% - 32px));
	}
	.note {
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
</style>
