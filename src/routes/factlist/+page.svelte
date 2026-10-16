<script lang="ts">
	import {
		FactList,
		Missing,
		Pane,
		StatusBadge,
		formatDate,
		formatMoney,
		type FactItem
	} from '#lib';
</script>

{#snippet state()}<StatusBadge label="Ready" tone="success" />{/snippet}
{#snippet date({ value }: { item: FactItem; value: unknown })}
	{#if typeof value === 'string' && value}{formatDate(value)}{:else}<Missing />{/if}
{/snippet}

<svelte:head><title>FactList · darksite</title></svelte:head>
<h1>FactList</h1>
<div class="col">
	<section class="inline">
		<h2 class="record">R-00412</h2>
		<FactList
			layout="inline"
			items={[
				{ label: 'Owner', value: 'A. Rivera' },
				{ label: 'State', cell: state },
				{ label: 'Opened', value: '2026-09-14', cell: date },
				{ label: 'Region', value: 'North' },
				{ label: 'Queue', value: null }
			] satisfies FactItem[]}
		/>
	</section>
	<Pane title="Details" tip="Straight in an unpadded pane: it takes the pane's inset.">
		<FactList
			items={[
				{ label: 'Identifier', value: 'R-00412', mono: true },
				{ label: 'State', cell: state },
				{ label: 'Owner', value: 'A. Rivera' },
				{ label: 'Queue', value: null },
				{
					label: 'Due',
					value: '2026-11-02',
					cell: date,
					tip: 'A calendar date: the same day in every time zone.'
				},
				{ label: 'Opened', value: '2026-09-14', cell: date },
				{ label: 'Closed', value: null, cell: date },
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
		<Pane title="Narrow">
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
	.inline {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-3);
	}
	.record {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
</style>
