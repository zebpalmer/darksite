<script lang="ts">
	import { focusShortcut } from '#lib';
	let { shortcut = '/', field = true }: { shortcut?: string | null; field?: boolean } = $props();
</script>

<input aria-label="Elsewhere" />
<div {@attach focusShortcut(shortcut)}>
	<button type="button">Clear</button>
	{#if field}<input aria-label="Find" />{/if}
</div>
