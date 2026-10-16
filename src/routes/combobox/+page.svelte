<script lang="ts">
	import { Chip, Combobox, Field, KeyCap, PageHeader, type ComboboxItem } from '#lib';
	let items = $state<ComboboxItem[]>([
		{ value: 'north', label: 'North wing', meta: '12' },
		{ value: 'south', label: 'South wing', meta: '4' },
		{ value: 'annex', label: 'Annex', meta: '31' },
		{ value: 'garage', label: 'Garage', meta: '0', disabled: true },
		{ value: 'roof', label: 'Roof', meta: '2' }
	]);
	let picked = $state<ComboboxItem[]>([]);
	let single = $state('');
</script>

<svelte:head><title>Combobox · darksite</title></svelte:head>
<PageHeader title="Combobox" />
<div class="demo">
	<div class="stack">
		<Field label="Sites">
			{#snippet children(f)}
				<Combobox
					{items}
					id={f.id}
					describedBy={f.describedBy}
					placeholder="Add a site"
					onselect={(item) => (picked = [...picked.filter((p) => p.value !== item.value), item])}
					oncreate={(text) => {
						const item = { value: text.toLowerCase(), label: text };
						items = [...items, item];
						picked = [...picked, item];
					}}
				/>
			{/snippet}
			{#snippet under()}
				<div class="row">
					{#each picked as p (p.value)}
						<Chip
							removable
							removeLabel="Remove {p.label}"
							onremove={() => (picked = picked.filter((x) => x.value !== p.value))}>{p.label}</Chip
						>
					{/each}
				</div>
			{/snippet}
		</Field>
		<Field label="Primary site">
			{#snippet children(f)}
				<Combobox {items} id={f.id} bind:value={single} clearOnSelect={false} openOnFocus />
			{/snippet}
		</Field>
		<Field label="Jump to site">
			{#snippet children(f)}
				<Combobox
					{items}
					id={f.id}
					placeholder="A long placeholder that stops short of the key"
					--trail-w="32px"
				>
					{#snippet trailing()}<KeyCap keys="/" decorative />{/snippet}
				</Combobox>
			{/snippet}
		</Field>
	</div>
	<p>↑/↓ move, Enter picks, ⇧Enter creates, Esc closes.</p>
</div>
