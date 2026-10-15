<script lang="ts">
	import { PageHeader, ScaleBadge } from '#lib';
	import { confidence } from '../scale-demo.js';
	import '../scale-demo.css';
</script>

<svelte:head><title>ScaleBadge · darksite</title></svelte:head>
<PageHeader title="ScaleBadge" />
<div class="demo confidence">
	<h2>Every stop</h2>
	<div class="row">
		{#each confidence.options() as s (s.value)}<ScaleBadge
				scale={confidence}
				value={s.value}
			/>{/each}
	</div>

	<h2>With the position bar</h2>
	<div class="stack">
		<ScaleBadge scale={confidence} value="c6" pips />
		<ScaleBadge scale={confidence} value="c2" pips />
		<ScaleBadge scale={confidence} value="unknown" pips />
	</div>

	<h2>Small</h2>
	<div class="row">
		<ScaleBadge scale={confidence} value="c5" size="sm" />
		<ScaleBadge scale={confidence} value="unknown" size="sm" />
	</div>
</div>
