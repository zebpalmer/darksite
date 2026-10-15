<script lang="ts">
	import { ActionBar, Button, PageHeader, toasts } from '#lib';
	let sticky = $state(false);
</script>

<svelte:head><title>ActionBar · darksite</title></svelte:head>
<PageHeader title="ActionBar" />

<h2>In a pane</h2>
<div class="pane">
	<div class="body">
		<p>The pane's content scrolls; the bar is its last child and never covers it.</p>
		{#each { length: 12 } as _, i (i)}<div class="line">Item {i + 1}</div>{/each}
	</div>
	<ActionBar>
		<Button variant="ghost">Skip</Button>
		<span class="grow"></span>
		<Button>Hold</Button>
		<span class="divider"></span>
		<Button variant="primary" onclick={() => toasts.success('Approved')}>Approve</Button>
	</ActionBar>
</div>

<h2>Page-level</h2>
<Button pressed={sticky} onclick={() => (sticky = !sticky)}>Show a sticky page bar</Button>
{#if sticky}
	<div class="spacer"></div>
	<ActionBar sticky>
		<span class="grow"></span>
		<Button variant="ghost" onclick={() => (sticky = false)}>Cancel</Button>
		<Button variant="primary" onclick={() => toasts.info('Saved')}>Save</Button>
	</ActionBar>
{/if}

<style>
	h2 {
		margin: var(--ds-space-6) 0 var(--ds-space-3);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	.pane {
		display: flex;
		flex-direction: column;
		height: 320px;
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: var(--ds-space-3) var(--ds-space-4);
	}
	p {
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	.line {
		padding: var(--ds-space-2) 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.spacer {
		height: 40vh;
	}
	.grow {
		flex: 1;
	}
	.divider {
		width: 1px;
		height: 24px;
		background: var(--ds-border);
	}
</style>
