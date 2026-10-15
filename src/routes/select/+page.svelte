<script lang="ts">
	import { Field, PageHeader, Select } from '#lib';
	let site = $state('');
	let status = $state('open');
</script>

<svelte:head><title>Select · darksite</title></svelte:head>
<PageHeader title="Select" />
<div class="demo">
	<div class="stack">
		<Field label="Site" required>
			{#snippet children(f)}
				<Select
					bind:value={site}
					id={f.id}
					describedBy={f.describedBy}
					options={[
						{ value: 'north', label: 'North wing' },
						{ value: 'south', label: 'South wing' },
						{ value: 'annex', label: 'Annex', disabled: true }
					]}
				/>
			{/snippet}
		</Field>
		<Field label="Status">
			{#snippet children(f)}
				<Select
					bind:value={status}
					id={f.id}
					groups={[
						{
							label: 'Active',
							options: [
								{ value: 'open', label: 'Open' },
								{ value: 'review', label: 'In review' }
							]
						},
						{ label: 'Closed', options: [{ value: 'done', label: 'Done' }] }
					]}
				/>
			{/snippet}
		</Field>
		<Select
			size="dense"
			aria-label="Density"
			value="m"
			options={[
				{ value: 's', label: 'Small' },
				{ value: 'm', label: 'Medium' }
			]}
		/>
	</div>
	<p class="out">site={JSON.stringify(site)} status={status}</p>
</div>
