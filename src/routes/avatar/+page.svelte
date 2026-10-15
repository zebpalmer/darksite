<script lang="ts">
	import { Avatar, PageHeader } from '#lib';
	import { thumb } from '../thumbs.js';
</script>

<svelte:head><title>Avatar · darksite</title></svelte:head>
<PageHeader title="Avatar" />
<div class="demo">
	<h2>People</h2>
	<div class="row">
		<Avatar name="Ada Lovelace" />
		<Avatar name="Grace Hopper" src={thumb(5, 64, 64)} />
		<Avatar name="Alan Turing" size={48} />
		<Avatar name="Broken Image" src="data:image/png;base64,AAAA" size={56} />
	</div>
	<h2>Organizations</h2>
	<div class="row">
		<Avatar name="Northwind Facilities" shape="square" />
		<Avatar name="Harbor Logistics" shape="square" size={48} />
		<Avatar name="Acme" shape="square" size={56} src={thumb(9, 112, 112)} />
	</div>
</div>
