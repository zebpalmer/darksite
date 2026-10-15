<script lang="ts">
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import List from '@lucide/svelte/icons/list';
	import { PageHeader, SegmentedControl } from '#lib';
	let density = $state('m');
	let view = $state('grid');
	let mode = $state('any');
</script>

<svelte:head><title>SegmentedControl · darksite</title></svelte:head>
<PageHeader title="SegmentedControl" />
<div class="demo">
	<div class="stack">
		<SegmentedControl
			label="Density"
			bind:value={density}
			options={[
				{ value: 's', label: 'S', keycap: '1' },
				{ value: 'm', label: 'M', keycap: '2' },
				{ value: 'l', label: 'L', keycap: '3' }
			]}
		/>
		<SegmentedControl
			label="View"
			bind:value={view}
			iconOnly
			options={[
				{ value: 'grid', label: 'Grid', icon: LayoutGrid },
				{ value: 'list', label: 'List', icon: List }
			]}
		/>
		<SegmentedControl
			label="Archived"
			bind:value={mode}
			full
			options={[
				{ value: 'include', label: 'Include', count: 1204 },
				{ value: 'any', label: "Don't care" },
				{ value: 'exclude', label: 'Exclude', count: 88 }
			]}
		/>
		<SegmentedControl
			label="Dense"
			size="dense"
			value="a"
			options={[
				{ value: 'a', label: 'Day' },
				{ value: 'b', label: 'Week' },
				{ value: 'c', label: 'Month', disabled: true }
			]}
		/>
	</div>
	<p class="out">density={density} view={view} archived={mode}</p>
</div>
