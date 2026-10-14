<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import Repeat from '@lucide/svelte/icons/repeat';
	import { Button } from '#lib';

	let saving = $state(false);
	function save() {
		saving = true;
		setTimeout(() => (saving = false), 1500);
	}
</script>

<svelte:head><title>Button · darksite</title></svelte:head>

<h1>Button</h1>

<section>
	<div class="row">
		<Button variant="ghost" keycap="space">Play</Button>
		<Button>Accept all</Button>
		<Button variant="primary" keycap="enter" loading={saving} loadingLabel="Saving" onclick={save}>
			Save
		</Button>
		<Button variant="danger">Delete</Button>
		<Button variant="danger-solid">Delete 12 records</Button>
	</div>
	<p>primary · secondary · ghost · danger · danger-solid (Dialog confirm only)</p>
</section>

<section>
	<div class="row">
		<Button variant="icon" label="Close" icon={X} />
		<Button variant="icon" label="Repeat" icon={Repeat} pressed={true} />
		<Button disabled>Disabled</Button>
		<Button loading loadingLabel="Saving">Save</Button>
		<Button href="/">A link</Button>
	</div>
	<p>icon (label required) · pressed · disabled · loading · href renders a link</p>
</section>

<section>
	<div class="row">
		<Button size="dense">dense 28</Button>
		<Button>default 32</Button>
		<Button size="comfy">comfy 36</Button>
		<Button size="touch">touch 44</Button>
	</div>
	<p>Under a coarse pointer every size is 44px.</p>
</section>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	section {
		margin-bottom: var(--ds-space-6);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
	}
	p {
		margin: var(--ds-space-2) 0 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
