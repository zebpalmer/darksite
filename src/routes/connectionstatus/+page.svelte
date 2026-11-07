<script lang="ts">
	import { ConnectionStatus, PageHeader, type ConnectionFailure } from '#lib';

	let failed = $state<ConnectionFailure[]>([
		{ id: 'a', label: 'Move R-00412 to Bay 3', reason: 'Already moved by someone else' },
		{ id: 'b', label: 'Note on R-00413', reason: 'The record was archived' }
	]);
	const dismiss = (id: string) => (failed = failed.filter((f) => f.id !== id));
</script>

<svelte:head><title>ConnectionStatus · darksite</title></svelte:head>
<PageHeader title="ConnectionStatus" />
<div class="demo">
	<p>
		The app's link to its server, for the top bar's actions or the rail's status slot. It renders
		nothing while everything is connected and sent; otherwise the worst state shows.
	</p>
	<dl>
		<dt>Offline, with changes kept on this device</dt>
		<dd><ConnectionStatus online={false} queued={3} /></dd>
		<dt>Reconnecting (fades in after 400ms)</dt>
		<dd><ConnectionStatus online reconnecting /></dd>
		<dt>Sending queued changes</dt>
		<dd><ConnectionStatus online syncing queued={2} /></dd>
		<dt>Changes waiting</dt>
		<dd><ConnectionStatus online queued={1} /></dd>
		<dt>Changes the server refused</dt>
		<dd>
			{#if failed.length}
				<ConnectionStatus online {failed} ondismiss={dismiss} onretry={() => (failed = [])} />
			{:else}
				<span class="out">All dismissed</span>
			{/if}
		</dd>
		<dt>Connected and sent</dt>
		<dd><ConnectionStatus online /><span class="out">(nothing)</span></dd>
	</dl>
</div>

<style>
	dl {
		display: grid;
		grid-template-columns: minmax(0, max-content) minmax(0, 1fr);
		gap: 12px 24px;
		align-items: center;
		margin: 0;
	}
	dt {
		color: var(--ds-text-2);
	}
	dd {
		margin: 0;
	}
	.out {
		color: var(--ds-text-3);
	}
</style>
