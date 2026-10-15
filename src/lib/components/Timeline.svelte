<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { DateInput } from '../time.js';

	/** Plain text, or `{ code }` for an identifier, which renders in mono. */
	export type TimelinePart = string | { code: string };

	export interface TimelineEntry {
		id: string;
		at: DateInput;
		/** A person's name. Omit it and set `source` for a system actor. */
		actor?: string;
		/** A system actor: a sync job, an import. Shown as a SourceBadge. */
		source?: string;
		verb: string;
		object?: TimelinePart | TimelinePart[];
		detail?: string;
		/** Consecutive entries with the same actor, verb and batchKey collapse into one row. */
		batchKey?: string;
	}
</script>

<!--
@component
Timeline — an audit or activity history. Each row is a sentence — actor, verb, object ("A. Rivera
assigned R-00412 to M. Lund") — with identifiers in mono, an optional detail line, and the time on
the right: relative under seven days, an absolute date after, the exact time and time zone in a
tooltip. A system actor shows a SourceBadge instead of a name.

Consecutive entries with the same actor, verb and `batchKey` collapse into one row ("set 55
records to Ready"), expandable to the individual entries. It shows a recent slice — `limit` rows —
and a "Show all" link to the full history; never an unbounded list.

- `entries` (newest first), `limit` (default 10), `allHref`, `batchSummary(entries)` (the object
  of a collapsed row; default "N items"), `entry` snippet (custom rendering), `now`, `label`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import SourceBadge from './SourceBadge.svelte';
	import { formatExact, formatRelative, isCalendarDate, toDate } from '../time.js';

	interface Props {
		entries: readonly TimelineEntry[];
		limit?: number;
		allHref?: string;
		batchSummary?: (entries: readonly TimelineEntry[]) => TimelinePart | TimelinePart[];
		entry?: Snippet<[TimelineEntry]>;
		now?: DateInput;
		label?: string;
		class?: string;
	}

	let {
		entries,
		limit = 10,
		allHref,
		batchSummary = (list) => `${list.length.toLocaleString()} items`,
		entry: custom,
		now,
		label = strings.history,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	// A calendar date has no time or zone; its machine form is the bare date.
	const machine = (at: DateInput) => (isCalendarDate(at) ? at.trim() : toDate(at).toISOString());

	type Row = { key: string; first: TimelineEntry; items: TimelineEntry[] };

	const rows = $derived.by(() => {
		const out: Row[] = [];
		for (const e of entries) {
			const last = out[out.length - 1];
			if (
				last &&
				e.batchKey &&
				last.first.batchKey === e.batchKey &&
				last.first.actor === e.actor &&
				last.first.source === e.source &&
				last.first.verb === e.verb
			) {
				last.items.push(e);
			} else {
				out.push({ key: e.id, first: e, items: [e] });
			}
		}
		return out;
	});
	const shown = $derived(rows.slice(0, limit));
	const more = $derived(rows.length > limit);

	let expanded = $state<Record<string, boolean>>({});
	const parts = (o: TimelinePart | TimelinePart[] | undefined): TimelinePart[] =>
		o === undefined ? [] : Array.isArray(o) ? o : [o];
</script>

{#snippet sentence(e: TimelineEntry, object: TimelinePart[])}
	{#if e.source && !e.actor}<SourceBadge source={e.source} variant="suggestion" title={strings.system(e.source)} />{:else}<span
			class="actor">{e.actor}</span
		>{/if}
	<span class="verb">{e.verb}</span>
	{#each object as part, i (i)}{#if typeof part === 'string'}{part}{:else}<code>{part.code}</code>{/if}{/each}
{/snippet}

{#snippet time(at: TimelineEntry['at'])}
	<time class="time" datetime={machine(at)} title={formatExact(at)}>{formatRelative(at, now)}</time>
{/snippet}

<div class="ds-timeline {className}">
	<ol aria-label={label}>
		{#each shown as row (row.key)}
			<li>
				{#if custom && row.items.length === 1}
					{@render custom(row.first)}
				{:else}
					<div class="line">
						<p class="text">
							{#if row.items.length > 1}
								{@render sentence(row.first, parts(batchSummary(row.items)))}
							{:else}
								{@render sentence(row.first, parts(row.first.object))}
							{/if}
						</p>
						{@render time(row.first.at)}
					</div>
					{#if row.items.length === 1 && row.first.detail}<p class="detail">{row.first.detail}</p>{/if}
					{#if row.items.length > 1}
						<button
							type="button"
							class="expand"
							aria-expanded={expanded[row.key] ? 'true' : 'false'}
							aria-controls="{uid}-batch-{row.key}"
							onclick={() => (expanded[row.key] = !expanded[row.key])}
						>
							<ChevronRight size={14} aria-hidden="true" />
							{expanded[row.key] ? strings.hideCount(row.items.length) : strings.showCount(row.items.length)}
						</button>
						{#if expanded[row.key]}
							<ol class="batch" id="{uid}-batch-{row.key}">
								{#each row.items as item (item.id)}
									<li class="line">
										<p class="text">{@render sentence(item, parts(item.object))}</p>
										{@render time(item.at)}
									</li>
								{/each}
							</ol>
						{/if}
					{/if}
				{/if}
			</li>
		{/each}
	</ol>
	{#if more && allHref}<a class="all" href={allHref}>{strings.showAll}</a>{/if}
</div>

<style>
	.ds-timeline {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.ds-timeline > ol > li {
		padding: 10px 0;
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	.line {
		display: flex;
		align-items: baseline;
		gap: 12px;
		min-width: 0;
	}
	.text {
		flex: 1;
		min-width: 0;
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.actor {
		color: var(--ds-text-1);
		font-weight: 500;
	}
	code {
		color: var(--ds-text-1);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.time {
		flex: none;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.detail {
		margin: 2px 0 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.expand {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
		padding: 2px 4px 2px 0;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-accent-text);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		cursor: pointer;
	}
	.expand[aria-expanded='true'] :global(svg) {
		transform: rotate(90deg);
	}
	.batch {
		margin: 6px 0 0 18px;
		padding-left: 10px;
		border-left: 1px solid var(--ds-border-subtle);
	}
	.batch .line {
		padding: 4px 0;
	}
	.batch .text {
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.all {
		align-self: flex-start;
		margin-top: 8px;
		color: var(--ds-accent-text);
		font-size: var(--ds-text-sm);
		text-decoration: none;
	}
	.all:hover {
		text-decoration: underline;
	}
</style>
