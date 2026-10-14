<script lang="ts">
	import { Stat, StatRow } from '#lib';
</script>

<svelte:head><title>Stat · darksite</title></svelte:head>
<h1>Stat</h1>
<StatRow label="Summary">
	<Stat
		label="Open records"
		value={12408}
		meta="185 open · 78 in progress · 24 blocked"
		href="/table"
	/>
	<Stat label="Ready" value={9214} of={12408} />
	<Stat label="Median age" value={4.2} unit="days" meta="Down from 5.1 last month" />
	<Stat label="Overdue" value={17} severity="high" meta="past their due date" href="/table" />
</StatRow>
<p>Two to four across by the row's own width. A severity is the only way to color a Stat.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
