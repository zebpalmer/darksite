<script lang="ts">
	// Test harness: a Menu with a real Button trigger. Lives outside src/lib so it never ships.
	import { Button, Menu, type MenuEntry } from '#lib';
	let { items }: { items: MenuEntry[] } = $props();
</script>

<Menu {items} label="Record actions">
	{#snippet trigger(attrs)}<Button {...attrs}>Actions</Button>{/snippet}
</Menu>
<button type="button">After</button>
