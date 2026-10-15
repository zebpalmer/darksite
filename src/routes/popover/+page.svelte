<script lang="ts">
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import { Button, KeyCap, PageHeader, Popover } from '#lib';
	let legend = $state(false);
	const keys = [
		['j', 'Next record'],
		['k', 'Previous record'],
		['shift+enter', 'Approve'],
		['/', 'Search'],
		['?', 'This legend']
	];
	function onkeydown(e: KeyboardEvent) {
		if (e.key === '?' && !(e.target instanceof HTMLInputElement)) legend = !legend;
	}
</script>

<svelte:window {onkeydown} />
<svelte:head><title>Popover · darksite</title></svelte:head>
<PageHeader title="Popover">
	{#snippet actions()}
		<Popover bind:open={legend} title="Keyboard shortcuts" closeOnOutside={false}>
			{#snippet trigger(attrs)}<Button {...attrs} variant="ghost" icon={Keyboard} keycap="?"
					>Shortcuts</Button
				>{/snippet}
			<dl class="legend">
				{#each keys as [k, what] (k)}<dt><KeyCap keys={k} /></dt>
					<dd>{what}</dd>{/each}
			</dl>
		</Popover>
	{/snippet}
</PageHeader>
<div class="demo">
	<p>
		Press <kbd>?</kbd> or use the button. The legend is non-modal and stays open while you work behind
		it; Esc or the trigger closes it. Below 768px it opens as a sheet.
	</p>
</div>

<style>
	.legend {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 8px 12px;
		align-items: center;
		margin: 0;
	}
	dd {
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
</style>
