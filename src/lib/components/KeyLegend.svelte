<!--
@component
KeyLegend — every hotkey a view has, grouped, each a KeyCap beside its label. Built from the same
binding table the handler uses (`hotkeys.ts`), so the legend cannot drift from the keys. Put it in
a `Popover` (a `Sheet` on phones, which Popover does itself); what opens it — conventionally `?` —
is the view's choice.

- `bindings` (`HotkeyBinding[]`, or a `HotkeyMap`), `order` (group names in legend order; others
  follow in table order, ungrouped last), `activeOnly` (leave out bindings whose `when` is false
  now), `columns` (default true: groups flow into columns when the legend is wide enough),
  `label` (the legend's name, default "Keyboard shortcuts"), `class`.
- Caps here are content, not hints: they always show, also with hints off and on phones.
-->
<script lang="ts">
	import KeyCap from './KeyCap.svelte';
	import { groupBindings, type HotkeyBinding, type HotkeyMap } from '../hotkeys.js';

	interface Props {
		bindings: readonly HotkeyBinding[] | HotkeyMap;
		order?: readonly string[];
		activeOnly?: boolean;
		columns?: boolean;
		label?: string;
		class?: string;
	}

	let {
		bindings,
		order = [],
		activeOnly = false,
		columns = true,
		label = 'Keyboard shortcuts',
		class: className = ''
	}: Props = $props();

	const list = $derived('bindings' in bindings ? bindings.bindings : bindings);
	const groups = $derived(groupBindings(list, order, activeOnly));
	const uid = $props.id();
</script>

<div
	class="ds-keylegend {className}"
	role="group"
	aria-label={label}
	data-columns={columns ? '' : undefined}
>
	{#each groups as g, gi (g.group)}
		<section class="group" aria-labelledby={g.group ? `${uid}-g${gi}` : undefined}>
			{#if g.group}<h3 class="title" id="{uid}-g{gi}">{g.group}</h3>{/if}
			<dl>
				{#each g.bindings as b, bi (`${b.action}:${bi}`)}
					<div class="row">
						<dt><KeyCap keys={b.keys} hint={false} /></dt>
						<dd>{b.label}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}
</div>

<style>
	.ds-keylegend {
		min-width: 0;
	}
	.ds-keylegend[data-columns] {
		columns: 2 220px;
		column-gap: 24px;
	}
	.group {
		break-inside: avoid;
		padding-bottom: 12px;
	}
	.title {
		margin: 0 0 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-weight: 500;
		line-height: var(--ds-lh-xs);
	}
	dl {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 28px;
	}
	dt {
		display: inline-flex;
		flex: none;
		min-width: 56px;
	}
	dd {
		flex: 1;
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
</style>
