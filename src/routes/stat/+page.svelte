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
<StatRow label="By stage" max={5}>
	<Stat label="Queued" value={42} />
	<Stat label="In review" value={18} />
	<Stat label="Approved" value={0} />
	<Stat label="Returned" value={null} />
	<Stat label="Total" value={60} />
</StatRow>
<p>
	A row of five with <code>max=&#123;5&#125;</code>: 2, 3, then 5 across. An empty value shows the
	missing mark.
</p>
<StatRow label="Network" max={3}>
	<Stat label="Nodes online" value={412} variant="headline" />
	<Stat label="Links" value={1284} variant="headline" />
	<Stat label="Sites" value={36} variant="headline" />
</StatRow>
<p>
	<code>variant="headline"</code> in a row of three (<code>max=&#123;3&#125;</code>): a public
	page's key figures, the label under the value.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	p {
		margin: var(--ds-space-3) 0 var(--ds-space-6);
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
