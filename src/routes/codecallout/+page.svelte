<script lang="ts">
	import { CodeCallout, Grid, PageHeader } from '#lib';
</script>

<svelte:head><title>CodeCallout · darksite</title></svelte:head>
<PageHeader title="CodeCallout" />
<div class="demo">
	<p>
		A short code shown large, to be written down, read aloud or typed on another device. The one
		place text goes above 32px outside an article title; the weight stays 500.
	</p>
	<div class="one">
		<CodeCallout
			code="R412"
			label="Write on the label"
			meta="Issued 09:12 · Stores, bay 3"
			accent
		/>
	</div>
	<Grid label="Code callouts" min={260}>
		<CodeCallout code="4KX9-2M" label="Enter on the new device" meta="Expires in 10 minutes" copy />
		<CodeCallout code="0O8B" label="Ambiguous glyphs" meta="Slashed zero where the font has one" />
		<CodeCallout code="Q7" />
	</Grid>
	<div class="narrow">
		<CodeCallout code="R412" label="Narrow container" meta="36px under 240px of its own width" />
	</div>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.one {
		max-width: 360px;
	}
	.narrow {
		max-width: 220px;
	}
</style>
