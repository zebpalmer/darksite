<script lang="ts">
	import { Card, Grid, PageHeader } from '#lib';
	import { thumb } from '../thumbs.js';
</script>

<svelte:head><title>Card · darksite</title></svelte:head>
<PageHeader title="Card" />
<div class="demo">
	<Grid label="Cards">
		<Card
			href="#a"
			title="Site walkthrough, north wing"
			thumbnail={thumb(1)}
			duration={1325}
			severity="medium"
			meta="Field team · 3 days ago"
			rating={4}
		/>
		<Card
			href="#b"
			title="Quarterly inspection"
			thumbnail={thumb(2)}
			duration={3725}
			progress={0.42}
			favorite
			meta="Inspections · Oct 2"
		/>
		<Card
			href="#c"
			title="Roof survey photos"
			thumbnail={thumb(3)}
			kind="gallery"
			imageCount={48}
			severity="high"
			meta="Surveys · 1 week ago"
		/>
		<Card
			href="#d"
			title="A record whose title is long enough to need truncating"
			thumbnail={thumb(4)}
			duration={84}
			meta="Archive"
		/>
		<Card href="#e" title="Missing thumbnail" duration={610} meta="Falls back to an icon tile" />
		<Card
			href="#f"
			title="Broken thumbnail"
			kind="gallery"
			thumbnail="data:image/png;base64,AAAA"
			imageCount={7}
			meta="Falls back too"
		/>
	</Grid>
</div>
