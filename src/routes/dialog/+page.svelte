<script lang="ts">
	import { Button, Dialog, Input, PageHeader, toasts } from '#lib';
	let del = $state(false);
	let fail = $state(false);
	let typed = $state(false);
	let word = $state('');
	const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
</script>

<svelte:head><title>Dialog · darksite</title></svelte:head>
<PageHeader title="Dialog" />
<div class="demo">
	<div class="row">
		<Button variant="danger" onclick={() => (del = true)}>Delete 3 records</Button>
		<Button onclick={() => (fail = true)}>Discard draft (fails)</Button>
		<Button variant="danger" onclick={() => ((word = ''), (typed = true))}>Delete everything</Button
		>
	</div>
	<p>Confirmations only. Focus starts on Cancel; Esc cancels; focus returns to the button.</p>
</div>

<Dialog
	bind:open={del}
	title="Delete 3 records?"
	description="They move to the trash for 30 days, then are gone."
	confirmLabel="Delete"
	confirmingLabel="Deleting"
	onconfirm={async () => {
		await wait(800);
		toasts.success('Deleted 3 records');
	}}
/>
<Dialog
	bind:open={fail}
	title="Discard this draft?"
	description="Your changes since the last save are lost."
	confirmLabel="Discard"
	onconfirm={async () => {
		await wait(500);
		throw new Error('The server did not answer. Try again.');
	}}
/>
<Dialog
	bind:open={typed}
	title="Delete all 1,204 records?"
	description="This cannot be undone. Type confirm to continue."
	confirmLabel="Delete all"
	confirmDisabled={word !== 'confirm'}
	initialFocus="content"
	onconfirm={() => void toasts.info('Nothing was deleted — this is a demo')}
>
	<Input bind:value={word} aria-label="Type confirm" placeholder="confirm" />
</Dialog>
