<script lang="ts">
	import { Button, Notice, PageHeader } from '#lib';

	let reset = $state(0);
	function restore() {
		for (const key of Object.keys(localStorage))
			if (key.startsWith('darksite:notice:demo-')) localStorage.removeItem(key);
		reset++;
	}
</script>

<svelte:head><title>Notice · darksite</title></svelte:head>
<PageHeader title="Notice" />
<div class="demo">
	<div class="list">
		<Notice message="Figures for the current month are provisional until the 5th." />
		<Notice
			tone="success"
			title="Import finished"
			message="412 records were added and 3 were updated."
		/>
		<Notice tone="warning" title="Two records need review" message="Their owners left the team.">
			{#snippet action()}<Button size="dense" href="#review">Review</Button>{/snippet}
		</Notice>
		<Notice tone="danger" message="This record could not be saved. Your changes are kept below." />
		{#key reset}
			<Notice
				id="demo-merged"
				dismissible
				message="This record was merged into R-00412. Its history moved with it."
			/>
		{/key}
	</div>
	<div class="row">
		<Button size="dense" onclick={restore}>Show dismissed notices</Button>
	</div>
	<p>
		Inside the page, among the content. A system-wide condition is a Banner; a field's problem is a
		Field error. A danger notice cannot be dismissed.
	</p>
	<div class="narrow">
		<Notice tone="warning" title="Narrow" message="Under 480px the action moves under the text.">
			{#snippet action()}<Button size="dense">Review</Button>{/snippet}
		</Notice>
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-3);
		max-width: 720px;
		margin-bottom: var(--ds-space-4);
	}
	.narrow {
		max-width: 340px;
		margin-top: var(--ds-space-4);
	}
</style>
