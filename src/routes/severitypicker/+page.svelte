<script lang="ts">
	import { PageHeader, SeverityPicker, type Severity } from '#lib';
	let value = $state<Severity | null>(null);
	let narrow = $state<Severity | null>('medium');
</script>

<svelte:head><title>SeverityPicker · darksite</title></svelte:head>
<PageHeader title="SeverityPicker" />
<div class="demo">
	<h2>Unset, with a suggestion</h2>
	<div style="max-width: 640px"><SeverityPicker bind:value suggested="high" keycaps /></div>
	<p class="out">value={String(value)}</p>

	<h2>Capped at High, with counts</h2>
	<div style="max-width: 640px">
		<SeverityPicker max="high" counts={{ info: 4, low: 12, medium: 7, high: 1 }} />
	</div>

	<h2>In a narrow pane</h2>
	<div style="max-width: 340px"><SeverityPicker bind:value={narrow} keycaps /></div>
</div>
