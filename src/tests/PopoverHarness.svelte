<script lang="ts">
	import { Button, Popover } from '#lib';
	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Popover bind:open title="Keyboard shortcuts">
	{#snippet trigger(attrs)}<Button {...attrs}>Shortcuts</Button>{/snippet}
	<p>Press J for next.</p>
</Popover>
