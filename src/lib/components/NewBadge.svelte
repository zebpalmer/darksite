<!--
@component
NewBadge — the quiet `new` pill: this value exists nowhere yet (checked by name, alias and spelling
variant), so choosing it creates it. One word, an accent outline, no sentence.
-->
<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class="ds-new {className}">new</span>

<style>
	.ds-new {
		display: inline-flex;
		align-items: center;
		flex: none;
		height: 16px;
		padding: 0 5px;
		border: 1px solid var(--ds-accent);
		border-radius: var(--ds-radius-xs);
		color: var(--ds-accent-text);
		font-size: var(--ds-text-xs);
		line-height: 1;
		white-space: nowrap;
	}
</style>
