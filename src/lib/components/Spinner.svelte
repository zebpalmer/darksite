<!--
@component
Spinner — the loader-circle icon, spinning; static under reduced motion. For "Loading more…" and
inside a loading Button only. Content whose shape is known loads as a SkeletonLoader instead.

- `size` (px, default 16).
- `label`: screen-reader text, which also makes it `role="status"`. Omit it when a visible "-ing"
  verb sits beside it.
-->
<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		size?: number;
		label?: string;
		class?: string;
	}

	let { size = 16, label, class: className = '' }: Props = $props();
</script>

<span class="ds-spinner {className}" role={label ? 'status' : undefined}>
	<LoaderCircle {size} aria-hidden="true" />
	{#if label}<span class="ds-sr-only">{label}</span>{/if}
</span>

<style>
	.ds-spinner {
		display: inline-flex;
		flex: none;
	}
	.ds-spinner :global(svg) {
		animation: ds-spin 0.9s linear infinite;
	}
</style>
