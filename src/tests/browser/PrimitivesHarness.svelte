<script lang="ts">
	import {
		Button,
		Combobox,
		JustifiedGrid,
		KeyCap,
		ScalePicker,
		defineScale,
		topmost,
		trackModal
	} from '#lib';

	let { viewer = false, onsubmitted }: { viewer?: boolean; onsubmitted?: () => void } = $props();

	const levels = defineScale({
		name: 'Level',
		stops: Array.from({ length: 8 }, (_, i) => ({
			value: `l${i + 1}`,
			label: `Level ${i + 1}`,
			mark: 'var(--ds-accent)',
			bg: 'var(--ds-accent-tint)',
			ink: 'var(--ds-accent-text)'
		}))
	});
	const tiles = Array.from({ length: 6 }, (_, i) => ({ id: i, aspect: i % 2 ? 1.5 : 0.75 }));
	const items = [{ value: 'a', label: 'Alpha' }];

	// A full-screen viewer that is a fixed element, not a <dialog>.
	function fixedModal(el: HTMLElement) {
		return trackModal(el);
	}
</script>

<div data-testid="caps-fixed" style="width: 500px">
	<ScalePicker scale={levels} keycaps columns={4} />
</div>
<div data-testid="caps-auto" style="width: 500px">
	<ScalePicker scale={levels} keycaps />
</div>

<div data-testid="tiles" style="width: 600px">
	<JustifiedGrid items={tiles} key={(t) => t.id} aspect={(t) => t.aspect} label="Tiles">
		{#snippet tile(t)}
			<button type="button" class="media">{t.id}</button>
			<span class="badge" style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px"
			></span>
		{/snippet}
	</JustifiedGrid>
</div>

<div data-testid="combo-trail" style="width: 300px">
	<Combobox {items} label="Jump" --trail-w="32px">
		{#snippet trailing()}<KeyCap keys="/" decorative />{/snippet}
	</Combobox>
</div>
<div data-testid="combo-plain" style="width: 300px">
	<Combobox {items} label="Plain" />
</div>

<form
	data-testid="form"
	onsubmit={(e) => {
		e.preventDefault();
		onsubmitted?.();
	}}
>
	<input aria-label="Name" />
	<Button variant="primary" type="submit" disabled reason="Fill in the name first">Save</Button>
</form>

<div class="home">
	<p
		class="notice"
		{@attach topmost}
		style="position: fixed; right: 16px; bottom: 16px; z-index: 1; margin: 0"
	>
		Update available
	</p>
</div>
{#if viewer}
	<div
		class="viewer"
		{@attach fixedModal}
		style="position: fixed; inset: 0; z-index: 100; background: var(--ds-bg-0)"
	></div>
{/if}
