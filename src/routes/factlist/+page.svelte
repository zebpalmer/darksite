<script lang="ts">
	import { FactList, Pane, StatusBadge, formatDate, formatMoney, type FactItem } from '#lib';
</script>

{#snippet state()}<StatusBadge label="Ready" tone="success" />{/snippet}

<svelte:head><title>FactList · darksite</title></svelte:head>
<h1>FactList</h1>
<div class="col">
	<Pane title="Details" padded>
		<FactList
			items={[
				{ label: 'Identifier', value: 'R-00412', mono: true },
				{ label: 'State', cell: state },
				{ label: 'Owner', value: 'A. Rivera' },
				{ label: 'Queue', value: null },
				{
					label: 'Due',
					value: formatDate('2026-11-02'),
					tip: 'A calendar date: the same day in every time zone.'
				},
				{ label: 'Cost', value: formatMoney(1240, 'USD', { maximumFractionDigits: 0 }) },
				{
					label: 'Note',
					value: 'Two columns of pairs from 560px, one below, label over value under 320px.',
					wide: true
				}
			] satisfies FactItem[]}
		/>
	</Pane>
	<div class="narrow">
		<Pane title="Narrow" padded>
			<FactList
				items={[
					{ label: 'Identifier', value: 'R-00412', mono: true },
					{ label: 'Queue', value: '' },
					{ label: 'Owner', value: 'Field team' }
				]}
			/>
		</Pane>
	</div>
</div>

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
		max-width: 800px;
	}
	.narrow {
		max-width: 300px;
	}
</style>
