<script lang="ts">
	import Cpu from '@lucide/svelte/icons/cpu';
	import User from '@lucide/svelte/icons/user';
	import { ChoiceTiles, PageHeader } from '#lib';

	let person = $state<string | undefined>('lovelace');
	let unit = $state<string | undefined>('b');
</script>

<svelte:head><title>ChoiceTiles · darksite</title></svelte:head>
<PageHeader title="ChoiceTiles" />
<div class="demo">
	<p>
		Pick one of a set of things that each carry a line of state. The grid follows its own width.
	</p>
	<h2>With a meta line and a state</h2>
	<ChoiceTiles
		label="Unit"
		bind:value={unit}
		min={200}
		options={[
			{ value: 'a', label: 'Unit A', meta: 'Idle since 09:00', icon: Cpu },
			{
				value: 'b',
				label: 'Unit B',
				meta: 'Running job 412',
				icon: Cpu,
				status: { label: 'In use', tone: 'accent' }
			},
			{
				value: 'c',
				label: 'Unit C',
				meta: 'Back Monday',
				icon: Cpu,
				status: { label: 'Service', tone: 'warning' },
				disabled: true
			},
			{ value: 'd', label: 'Unit D', meta: 'Idle', icon: Cpu },
			{
				value: 'e',
				label: 'Unit E with a name long enough to need truncating',
				meta: 'Running job 415 and then job 416',
				icon: Cpu
			}
		]}
	/>
	<p class="out">unit={unit}</p>
	<h2>Label only</h2>
	<ChoiceTiles
		label="Operator"
		bind:value={person}
		min={140}
		options={[
			{ value: 'lovelace', label: 'A. Lovelace', icon: User },
			{ value: 'hopper', label: 'G. Hopper', icon: User },
			{ value: 'rivera', label: 'A. Rivera', icon: User }
		]}
	/>
	<p class="out">operator={person}</p>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.out {
		color: var(--ds-text-3);
	}
</style>
