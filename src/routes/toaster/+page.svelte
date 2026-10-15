<script lang="ts">
	import { Button, PageHeader, toasts } from '#lib';
	let archived = $state(0);

	function archive() {
		archived += 1;
		toasts.push({
			id: 'archive',
			message: `Archived ${archived} ${archived === 1 ? 'record' : 'records'}`,
			action: { label: 'Undo', keycap: 'z', onAction: () => (archived = 0) },
			onDismiss: () => (archived = 0)
		});
	}
</script>

<svelte:head><title>Toaster · darksite</title></svelte:head>
<PageHeader title="Toaster" />
<div class="row">
	<Button onclick={() => toasts.success('Saved')}>Success</Button>
	<Button onclick={() => toasts.info('Export started')}>Info</Button>
	<Button onclick={() => toasts.warning('Two records were skipped')}>Warning</Button>
	<Button onclick={() => toasts.error('Could not reach the server')}>Error</Button>
	<Button variant="primary" onclick={archive}>Archive (undoable)</Button>
</div>
<p>
	Never more than two. Hovering or focusing a toast pauses it. The Undo toast's key cap works as a
	hotkey while it shows: press <kbd>Z</kbd>.
</p>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
	p {
		max-width: 640px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
</style>
