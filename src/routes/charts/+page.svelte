<script lang="ts">
	import { BarSeries, CellBar, Pane, PageHeader, Ring, Table, type TableColumn } from '#lib';

	const days = Array.from({ length: 30 }, (_, i) => {
		const d = new Date(2026, 8, 17 + i);
		const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		return {
			label,
			title: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
			values: {
				opened: 20 + ((i * 37) % 23),
				review: 8 + ((i * 11) % 9),
				closed: 12 + ((i * 17) % 19)
			}
		};
	});
	const series = [
		{ key: 'opened', label: 'Opened' },
		{ key: 'review', label: 'In review' },
		{ key: 'closed', label: 'Closed' }
	];

	interface Row {
		id: string;
		team: string;
		records: number;
	}
	const rows: Row[] = [
		{ id: '1', team: 'Field team', records: 1240 },
		{ id: '2', team: 'Ops desk', records: 812 },
		{ id: '3', team: 'Intake', records: 310 },
		{ id: '4', team: 'Archive', records: 42 }
	];
	const max = Math.max(...rows.map((r) => r.records));
	const columns: TableColumn<Row>[] = [
		{ key: 'team', label: 'Team' },
		{ key: 'records', label: 'Records', align: 'end', width: '220px', cell: records }
	];
</script>

{#snippet records(row: Row)}<CellBar value={row.records} {max} />{/snippet}

<svelte:head><title>Charts · darksite</title></svelte:head>
<PageHeader title="Charts" />
<div class="demo">
	<p>
		Three small charts, deliberately limited: categorical colors only, a tooltip, and a data table
		behind each for assistive technology. No axes library, no zoom.
	</p>

	<h2>BarSeries</h2>
	<div class="col">
		<Pane title="Records per day" padded>
			<BarSeries {series} data={days} label="Records per day, last 30 days" />
		</Pane>
		<Pane title="Opened per day" padded>
			<BarSeries
				series={[{ key: 'opened', label: 'Opened', tone: 'accent-2' }]}
				data={days.slice(-12)}
				label="Records opened per day"
				height={96}
			/>
		</Pane>
	</div>

	<h2>Ring</h2>
	<div class="row rings">
		<Ring
			label="Records by state"
			centerLabel="records"
			segments={[
				{ label: 'Open', value: 185 },
				{ label: 'In progress', value: 78 },
				{ label: 'Blocked', value: 24 }
			]}
		/>
		<Ring
			label="Storage used"
			max={100}
			centerValue="71%"
			centerLabel="used"
			segments={[{ label: 'Used', value: 71 }]}
			format={(v) => `${v} GB`}
			size={96}
		/>
	</div>

	<h2>CellBar</h2>
	<div class="col">
		<Table {rows} {columns} rowKey={(r) => r.id} label="Records by team" />
	</div>
</div>

<style>
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-4);
		max-width: 720px;
	}
	.rings {
		gap: var(--ds-space-8);
	}
</style>
