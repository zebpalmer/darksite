<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import { Button, EntityCard, Grid, PageHeader } from '#lib';
	import { thumb } from '../thumbs.js';
</script>

<svelte:head><title>EntityCard · darksite</title></svelte:head>
<PageHeader title="EntityCard" />
<div class="demo">
	<Grid min={280} label="Organizations and people">
		<EntityCard
			href="#1"
			name="Northwind Facilities"
			shape="square"
			code="NW"
			meta="Owner · 84 records"
			image={thumb(7, 112, 112)}
		/>
		<EntityCard
			href="#2"
			name="Harbor Logistics"
			shape="square"
			code="HB"
			meta="Contractor · 12 records"
		/>
		<EntityCard
			href="#3"
			name="Ada Lovelace"
			meta="Inspector · 31 records"
			image={thumb(11, 112, 112)}
		/>
		<EntityCard href="#4" name="Grace Hopper" meta="Reviewer · 9 records">
			{#snippet trailing()}<Button
					variant="icon"
					icon={Star}
					label="Favorite Grace Hopper"
				/>{/snippet}
		</EntityCard>
	</Grid>
</div>
