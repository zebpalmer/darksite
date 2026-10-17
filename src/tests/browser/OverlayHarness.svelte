<script lang="ts">
	// Browser-mode harness: real triggers for the modal and popover components.
	import { Button, Combobox, Dialog, HelpTip, Menu, Popover, Sheet } from '#lib';

	let dialog = $state(false);
	let sheet = $state(false);
	let hero = $state(false);
	const items = [
		{ value: 'n', label: 'North wing' },
		{ value: 's', label: 'South wing' },
		{ value: 'a', label: 'Annex' }
	];
</script>

<div style="padding: 24px; display: flex; gap: 8px; align-items: center;">
	<Button onclick={() => (dialog = true)}>Delete</Button>
	<Button onclick={() => (sheet = true)}>Edit</Button>
	<Button onclick={() => (hero = true)}>Sign up</Button>
	<Menu
		label="Record actions"
		items={[
			{ id: 'a', label: 'Archive' },
			{ id: 'b', label: 'Duplicate' }
		]}
	>
		{#snippet trigger(attrs)}<Button {...attrs}>Actions</Button>{/snippet}
	</Menu>
	<Popover title="Shortcuts">
		{#snippet trigger(attrs)}<Button {...attrs}>Shortcuts</Button>{/snippet}
		<p>J for next.</p>
	</Popover>
	<div style="width: 240px"><Combobox {items} label="Site" /></div>
	<HelpTip text="Applies to new records only" />
</div>
<div style="position: fixed; right: 2px; top: 40px;">
	<HelpTip text="A note near the right edge that must stay on screen" label="Edge note" />
</div>

<Dialog bind:open={dialog} title="Delete 3 records?" confirmLabel="Delete" onconfirm={() => {}} />
<Dialog
	bind:open={hero}
	size="hero"
	title="Welcome"
	description="Make an account to keep your place."
	confirmLabel="Get started"
	cancelLabel="Not now"
	initialFocus="field"
	onconfirm={() => {}}
>
	<input aria-label="Email" type="email" />
</Dialog>
<Sheet bind:open={sheet} title="Edit record"><input aria-label="Title" /></Sheet>
