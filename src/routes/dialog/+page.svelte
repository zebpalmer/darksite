<script lang="ts">
	import { Button, Dialog, Field, Input, PageHeader, toasts } from '#lib';
	let del = $state(false);
	let fail = $state(false);
	let typed = $state(false);
	let word = $state('');
	let archiving = $state(false);
	let note = $state('');
	let welcome = $state(false);
	let email = $state('');
	const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
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
		<Button onclick={() => ((note = ''), (archiving = true))}>Archive with a note</Button>
	</div>
	<p>Confirmations only. Focus starts on Cancel; Esc cancels; focus returns to the button.</p>
	<h2>Hero</h2>
	<div class="row">
		<Button variant="primary" onclick={() => ((email = ''), (welcome = true))}>Sign up</Button>
	</div>
	<p>
		<code>size="hero"</code>: a welcome or sign-up moment. 520px and centered on a desktop, a bottom
		sheet on a phone.
	</p>
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
<Dialog
	bind:open={archiving}
	title="Archive this record?"
	description="It leaves every queue. The note is kept in its history."
	tone="default"
	confirmLabel="Archive"
	confirmDisabled={!note.trim()}
	initialFocus="field"
	onconfirm={() => void toasts.success('Archived R-00412')}
>
	<Field label="Note" required>
		{#snippet children(f)}
			<Input bind:value={note} id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />
		{/snippet}
	</Field>
</Dialog>
<Dialog
	bind:open={welcome}
	size="hero"
	title="Get the weekly digest"
	description="One email a week with what changed, and nothing else. Leave whenever you like."
	confirmLabel="Subscribe"
	cancelLabel="Not now"
	confirmDisabled={!emailValid}
	initialFocus="field"
	onconfirm={() => void toasts.success('Subscribed')}
>
	<Field label="Email">
		{#snippet children(f)}
			<Input
				bind:value={email}
				id={f.id}
				type="email"
				autocomplete="email"
				placeholder="name@example.com"
				aria-describedby={f.describedBy}
			/>
		{/snippet}
	</Field>
</Dialog>
