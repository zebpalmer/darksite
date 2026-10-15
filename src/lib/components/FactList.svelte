<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** One label–value pair. `key` defaults to `label`. */
	export interface FactItem {
		key?: string;
		label: string;
		/** `null`, `undefined` or `''` render the missing-value mark. */
		value?: unknown;
		/** Identifiers, serials, hashes, paths: mono with tabular figures. */
		mono?: boolean;
		/** An explanation, as a HelpTip beside the label. */
		tip?: string;
		/** Span both columns, for a long value such as a note or an address. */
		wide?: boolean;
		/** Custom rendering for this value: a StatusBadge, a link, a person. Receives `{ item, value }`. */
		cell?: Snippet<[{ item: FactItem; value: unknown }]>;
	}
</script>

<!--
@component
FactList — label–value pairs for a detail pane: a native description list (`<dl>`). Labels in
13px ds-text-3 beside values in ds-text-1, two columns of pairs when the list is 560px wide or
more, one below it, and each label stacks above its value under 320px — all by the list's own
width. A missing value renders the `Missing` mark.

- `items` (`{ key?, label, value?, mono?, tip?, wide?, cell? }[]`; an item's `cell` receives
  `{ item, value }`), `columns` (`2` default | `1`), `cell` (fallback rendering for items without
  their own; receives `{ item, value }`), `missing` (the mark), `class`. Set `--ds-facts-label` to
  change the 128px label column.
- Inset: `--ds-facts-inset` (sides) and `--ds-facts-inset-block` (top and bottom), 0 by default.
  An unpadded Pane sets them to 14px and 8px, so a FactList sits at the pane's inset with no
  wrapper; a `padded` Pane sets them back to 0.
-->
<script lang="ts">
	import HelpTip from './HelpTip.svelte';
	import Missing from './Missing.svelte';

	interface Props {
		items: readonly FactItem[];
		columns?: 1 | 2;
		cell?: Snippet<[{ item: FactItem; value: unknown }]>;
		missing?: string;
		class?: string;
	}

	let { items, columns = 2, cell, missing = '—', class: className = '' }: Props = $props();

	function isMissing(value: unknown): boolean {
		return value === null || value === undefined || value === '';
	}
</script>

<div class="ds-facts {className}" data-columns={columns}>
	<dl>
		{#each items as item (item.key ?? item.label)}
			<div class="fact" data-wide={item.wide ? '' : undefined}>
				<dt>
					<span class="label">{item.label}</span>
					{#if item.tip}<HelpTip text={item.tip} />{/if}
				</dt>
				<dd data-mono={item.mono ? '' : undefined}>
					{#if item.cell}
						{@render item.cell({ item, value: item.value })}
					{:else if cell}
						{@render cell({ item, value: item.value })}
					{:else if isMissing(item.value)}
						<Missing mark={missing} />
					{:else}
						{String(item.value)}
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	.ds-facts {
		container-type: inline-size;
		min-width: 0;
		padding: var(--ds-facts-inset-block, 0px) var(--ds-facts-inset, 0px);
	}
	dl {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		column-gap: 24px;
		margin: 0;
	}
	.fact {
		display: grid;
		grid-template-columns: var(--ds-facts-label, 128px) minmax(0, 1fr);
		align-items: baseline;
		gap: 12px;
		min-width: 0;
		padding: 6px 0;
	}
	dt {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	dd {
		min-width: 0;
		margin: 0;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		overflow-wrap: anywhere;
	}
	dd[data-mono] {
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	@container (min-width: 560px) {
		[data-columns='2'] dl {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		[data-columns='2'] .fact[data-wide] {
			grid-column: 1 / -1;
		}
	}
	@container (max-width: 319.98px) {
		.fact {
			grid-template-columns: minmax(0, 1fr);
			gap: 2px;
		}
	}
</style>
