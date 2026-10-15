<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { Button, PageHeader, tooltip } from '#lib';
</script>

<svelte:head><title>Tooltip · darksite</title></svelte:head>
<PageHeader title="Tooltip" />
<div class="demo">
	<h2>Icon buttons</h2>
	<p>An icon button's label is its tooltip. Hover, Tab to it, or long-press on a touch screen.</p>
	<div class="row">
		<Button variant="icon" icon={Copy} label="Copy link" />
		<Button variant="icon" icon={Download} label="Download" />
		<Button variant="icon" icon={Trash} label="Delete" />
	</div>

	<h2>A title on any Button</h2>
	<div class="row">
		<Button title="Exports the rows the filters show">Export</Button>
	</div>

	<h2>On any focusable element</h2>
	<p>
		<a href="#r-00412" {@attach tooltip('Opened 3 times this week')}>R-00412</a> — the attachment works
		on links and other controls.
	</p>
</div>
