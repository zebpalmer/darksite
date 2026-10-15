<!--
@component
Missing — the missing-value mark: an em dash in ds-text-3, announced as "No value". Use it wherever
a value can be absent (a table cell, a fact, a stat's meta) so a blank never reads as still
loading. `Table` and `FactList` render it for you.

- `mark` (default "—"), `label` (what a screen reader hears; default "No value"), `class`.
-->
<script lang="ts">
	interface Props {
		mark?: string;
		label?: string;
		class?: string;
	}

	let { mark = '—', label = 'No value', class: className = '' }: Props = $props();
</script>

<span class="ds-missing {className}"
	><span class="mark" aria-hidden="true">{mark}</span><span class="ds-sr-only">{label}</span></span
>

<style>
	.ds-missing {
		color: var(--ds-text-3);
	}
</style>
