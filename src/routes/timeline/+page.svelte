<script lang="ts">
	import { Timeline, type TimelineEntry } from '#lib';
	const t = (min: number) => new Date(Date.now() - min * 60_000);
	const entries: TimelineEntry[] = [
		{
			id: '1',
			at: t(6),
			actor: 'A. Rivera',
			verb: 'assigned',
			object: [{ code: 'R-00412' }, ' to M. Lund']
		},
		...Array.from({ length: 55 }, (_, i) => ({
			id: `b${i}`,
			at: t(95),
			actor: 'M. Lund',
			verb: 'set',
			object: [{ code: `R-${String(41200 + i)}` }, ' to Ready'],
			batchKey: 'req-7'
		})),
		{
			id: '3',
			at: t(60 * 26),
			source: 'Nightly import',
			verb: 'created',
			object: [{ code: 'R-00413' }],
			detail: 'From the overnight file, 1 of 40 new records'
		},
		{
			id: '4',
			at: t(60 * 24 * 12),
			actor: 'Ops desk',
			verb: 'archived',
			object: [{ code: 'R-00087' }]
		}
	];
</script>

<svelte:head><title>Timeline · darksite</title></svelte:head>
<h1>Timeline</h1>
<div class="col">
	<Timeline {entries} allHref="#history" batchSummary={(l) => `${l.length} records to Ready`} />
</div>
<p>Relative under seven days, a date after; the exact time and zone are in each time's tooltip.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-4);
		max-width: 720px;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
