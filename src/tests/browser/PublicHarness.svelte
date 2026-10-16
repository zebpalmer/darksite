<script lang="ts">
	import {
		BarSeries,
		Button,
		CellBar,
		CodeBlock,
		FactList,
		Notice,
		Ring,
		Slider,
		Table,
		type TableColumn
	} from '#lib';

	const facts = [
		{ label: 'Owner', value: 'A. Rivera' },
		{ label: 'Opened', value: 'Oct 2' },
		{ label: 'Region', value: 'North' },
		{ label: 'Queue', value: 'Intake' }
	];
	const long =
		'curl --header "Accept: application/json" https://example.com/api/v1/records?state=open&limit=50&page=2';
	const series = [
		{ key: 'a', label: 'Opened' },
		{ key: 'b', label: 'Closed' }
	];
	const data = Array.from({ length: 12 }, (_, i) => ({
		label: `Oct ${i + 1}`,
		values: { a: (i * 7) % 11, b: (i * 3) % 5 }
	}));
	interface Row {
		id: string;
		name: string;
		count: number;
	}
	const rows: Row[] = [
		{ id: '1', name: 'Alpha', count: 1240 },
		{ id: '2', name: 'Bravo', count: 310 }
	];
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'count', label: 'Items', align: 'end', width: '200px' }
	];
</script>

{#snippet bar(row: Row)}<CellBar value={row.count} max={1240} />{/snippet}

<div style="width: 300px" data-testid="code"><CodeBlock code={long} label="Shell" /></div>

{#snippet action()}<Button size="dense">Review</Button>{/snippet}
<div style="width: 360px" data-testid="notice-narrow">
	<Notice title="Figures are provisional" message="The current month closes on the 5th." {action} />
</div>
<div style="width: 760px" data-testid="notice-wide">
	<Notice message="The current month closes on the 5th." {action} />
</div>

<div style="width: 220px" data-testid="facts-narrow">
	<FactList layout="inline" items={facts} />
</div>
<div style="width: 900px" data-testid="facts-wide"><FactList layout="inline" items={facts} /></div>

<div style="width: 400px" data-testid="slider">
	<Slider value={50} label="Detail" ticks={[0, { value: 50, label: 'Normal' }, 100]} showValue />
</div>

<div style="width: 480px; margin-top: 160px" data-testid="bars">
	<BarSeries {series} {data} label="Records per day" />
</div>
<div data-testid="ring">
	<Ring
		label="Records by state"
		segments={[
			{ label: 'Done', value: 60 },
			{ label: 'In progress', value: 30 },
			{ label: 'Blocked', value: 10 }
		]}
	/>
</div>

<div style="width: 600px" data-testid="table">
	<Table
		{rows}
		columns={columns.map((c) => (c.key === 'count' ? { ...c, cell: bar } : c))}
		rowKey={(r) => r.id}
		label="Counts"
	/>
</div>
