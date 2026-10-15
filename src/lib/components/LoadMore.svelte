<!--
@component
LoadMore — the foot of a long Table or list (docs/layout.md, "Long lists"): a `meta` line ("Showing
50 of 295") beside a full-width secondary Button reading "Load more", which takes its loading state
while the next page loads. Rows append below; nothing else moves. No page numbers.

New rows never steal focus — except when the button itself was pressed from the keyboard: then,
once the rows have arrived, `focusRow(index)` is called with the index of the first new row, so the
next arrow key continues into them. Without `focusRow`, focus stays on the button.

- `shown` (rows loaded), `total` (when known), `hasMore` (default `shown < total`), `loading`,
  `onLoadMore()` (may return a promise), `focusRow(index)`, `label` (default "Load more"), `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import Button from './Button.svelte';

	interface Props {
		shown: number;
		total?: number | null;
		hasMore?: boolean;
		loading?: boolean;
		onLoadMore: () => void | Promise<void>;
		focusRow?: (index: number) => void;
		label?: string;
		class?: string;
	}

	let {
		shown,
		total = null,
		hasMore,
		loading = false,
		onLoadMore,
		focusRow,
		label = strings.loadMore,
		class: className = ''
	}: Props = $props();

	const more = $derived(hasMore ?? (total !== null && shown < total));
	let busy = $state(false);
	// The first new row's index, while a keyboard press waits for its rows.
	let pendingFocus = $state<number | null>(null);
	let byKeyboard = false;

	$effect(() => {
		if (pendingFocus !== null && shown > pendingFocus && !loading && !busy) {
			const index = pendingFocus;
			pendingFocus = null;
			queueMicrotask(() => focusRow?.(index));
		}
	});

	async function load() {
		if (busy || loading) return;
		if (byKeyboard && focusRow) pendingFocus = shown;
		byKeyboard = false;
		busy = true;
		try {
			await onLoadMore();
		} finally {
			busy = false;
		}
	}
</script>

{#if more || total !== null}
	<div class="ds-loadmore {className}">
		{#if total !== null}<span class="meta">{strings.showing(shown, total)}</span>{/if}
		{#if more}
			<Button
				full
				loading={loading || busy}
				loadingLabel={strings.loadingMore}
				onkeydown={(e: KeyboardEvent) => (byKeyboard = e.key === 'Enter' || e.key === ' ')}
				onpointerdown={() => (byKeyboard = false)}
				onclick={load}>{label}</Button
			>
		{/if}
	</div>
{/if}

<style>
	.ds-loadmore {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
		padding: 12px 0;
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		text-align: center;
	}
</style>
