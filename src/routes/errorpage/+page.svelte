<script lang="ts">
	import { ErrorPage, PageHeader, SegmentedControl } from '#lib';

	let status = $state<number>(404);
	const options = [
		{ value: 404, label: '404' },
		{ value: 403, label: '403' },
		{ value: 500, label: '500' },
		{ value: 0, label: 'Offline' }
	];
</script>

<svelte:head><title>ErrorPage · darksite</title></svelte:head>
<PageHeader title="ErrorPage" />
<div class="demo">
	<p>The focused page for a failed route, with neutral copy for each status.</p>
	<SegmentedControl {options} bind:value={status} label="Status" />
	<div class="frame">
		<ErrorPage
			{status}
			homeHref="/"
			onretry={status === 404 || status === 403 ? undefined : () => {}}
			detail={status === 500 ? 'Reference R-00412' : undefined}
		/>
	</div>
</div>

<style>
	.frame {
		margin-top: var(--ds-space-4);
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
</style>
