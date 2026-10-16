<!--
@component
FullBleed — a page that takes the whole content column: a map, a canvas, a diagram. Inside AppShell
the column's padding and the footer go, and the shell locks to the viewport at every width, so the
page fills exactly what the navigation, Banner and TopBar leave. Overlay panels go inside it, placed
with absolute positioning.

- `label` (names the region for assistive technology), `class`, children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, class: className = '', children }: { label?: string; class?: string; children: Snippet } =
		$props();
</script>

<div class="ds-fullbleed {className}" role={label ? 'region' : undefined} aria-label={label}>
	{@render children()}
</div>

<style>
	.ds-fullbleed {
		position: relative;
		flex: 1;
		min-width: 0;
		min-height: 0;
		height: 100%;
		overflow: hidden;
	}
</style>
