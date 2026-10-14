<!--
@component
StatRow — a row of Stats, two to four across by the row's own width (a container query, never the
viewport): 2 below 560px, 3 below 800px, 4 from there. `label` names the group for assistive tech.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, class: className = '', children }: { label?: string; class?: string; children: Snippet } =
		$props();
</script>

<div class="ds-statrow {className}" role={label ? 'group' : undefined} aria-label={label}>
	<div class="grid">{@render children()}</div>
</div>

<style>
	.ds-statrow {
		container-type: inline-size;
		min-width: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	@container (min-width: 560px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@container (min-width: 800px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
