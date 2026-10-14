<script lang="ts">
	import CornerLeftUp from '@lucide/svelte/icons/corner-left-up';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { HelpTip } from '#lib';
</script>

<svelte:head><title>HelpTip · darksite</title></svelte:head>
<h1>HelpTip</h1>
<div class="row" style="margin-top: 40px">
	<span>Minimum severity <HelpTip text="The lowest severity this tag can be assigned." /></span>
	<span>Escalations <HelpTip text="Inherited from the parent tag." icon={CornerLeftUp} /></span>
	<span
		>Urgent <HelpTip
			text="The rule on this tag is not met."
			icon={TriangleAlert}
			tone="warning"
		/></span
	>
</div>
<p>Hover, or tab to an icon: the note appears, and it is the icon's accessible name.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
