<script lang="ts">
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import {
		Button,
		KeyLegend,
		PageHeader,
		Popover,
		buildHotkeyMap,
		installHotkeys,
		type HotkeyBinding
	} from '#lib';

	type Action = 'next' | 'prev' | 'approve' | 'hold' | 'search' | 'legend';

	let legend = $state(false);
	let at = $state(0);
	let last = $state('Nothing yet');
	const records = ['R-00410', 'R-00411', 'R-00412', 'R-00413'];

	const bindings: HotkeyBinding<Action>[] = [
		{ keys: ['j', 'down'], action: 'next', label: 'Next record', group: 'Move' },
		{ keys: ['k', 'up'], action: 'prev', label: 'Previous record', group: 'Move' },
		{ keys: 'shift+enter', action: 'approve', label: 'Approve', group: 'Record' },
		{ keys: 'h', action: 'hold', label: 'Put on hold', group: 'Record' },
		{ keys: '/', action: 'search', label: 'Search', group: 'Help' },
		{ keys: '?', action: 'legend', label: 'Show shortcuts', group: 'Help' }
	];
	const map = buildHotkeyMap(bindings);

	function run(action: Action) {
		if (action === 'legend') legend = !legend;
		else if (action === 'next') at = Math.min(records.length - 1, at + 1);
		else if (action === 'prev') at = Math.max(0, at - 1);
		last = `${bindings.find((b) => b.action === action)?.label} · ${records[at]}`;
	}

	$effect(() => installHotkeys(map, run));
</script>

<svelte:head><title>KeyLegend · darksite</title></svelte:head>
<PageHeader title="KeyLegend">
	{#snippet actions()}
		<Popover bind:open={legend} title="Keyboard shortcuts" width="420px" closeOnOutside={false}>
			{#snippet trigger(attrs)}<Button {...attrs} variant="ghost" icon={Keyboard} keycap="?"
					>Shortcuts</Button
				>{/snippet}
			<KeyLegend bindings={map} order={['Move', 'Record', 'Help']} />
		</Popover>
	{/snippet}
</PageHeader>
<div class="demo">
	<p>
		One binding table drives the keys and the legend. Press <kbd>j</kbd>, <kbd>k</kbd> or
		<kbd>?</kbd>; the keys stand aside while you type in a field.
	</p>
	<p class="out">Last: {last}</p>
	<h2>Inline</h2>
	<div class="box"><KeyLegend bindings={map} order={['Move', 'Record', 'Help']} /></div>
	<p class="out">Conflicts in this table: {map.conflicts.length}</p>
</div>

<style>
	.box {
		max-width: 560px;
		padding: var(--ds-space-4);
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
	}
</style>
