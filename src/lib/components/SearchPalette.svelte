<script lang="ts" module>
	import { isTypingTarget, matchesKey } from '../keycap.js';
	import { modals } from '../layers.svelte.js';
	import type { IconComponent } from '../types.js';

	/** One thing a search found: a destination. */
	export interface SearchResult {
		id: string;
		title: string;
		href: string;
		/** The muted text at the row's end: a kind, a date, an identifier. */
		meta?: string;
		/** A leading icon. */
		icon?: IconComponent;
		/** A small colored dot instead of an icon: a `ds-*` role name, such as `accent` or `success`. */
		dot?: string;
		/** The id of the group it belongs to; filled in from its group when left out. */
		group?: string;
	}

	/** Results of one kind, under one heading: People, Records, Docs. */
	export interface SearchGroup {
		id: string;
		label: string;
		items: SearchResult[];
		/** How many there are in all, when `items` holds only some: the scope chip's count. */
		total?: number;
	}

	/** The consumer's search. Return every group that matched (empty ones are left out); a slow
	 *  search should stop when `signal` aborts, which it does as soon as the query changes. */
	export type SearchFn = (
		query: string,
		signal: AbortSignal
	) => Promise<readonly SearchGroup[]> | readonly SearchGroup[];

	/** The keys that open a site's search by convention: `/`, ⌘K and Ctrl+K. */
	export const SEARCH_KEYS: readonly string[] = ['/', 'meta+k', 'ctrl+k'];

	/**
	 * Opens a search from anywhere on the page: calls `open` on `/`, ⌘K or Ctrl+K (or `keys`). It
	 * stands aside while the user is typing in a field, while a modal is open, and when something
	 * earlier already handled the press; a press it takes is `preventDefault`ed. Returns the
	 * cleanup, so it fits an effect:
	 *
	 *   $effect(() => searchShortcut(() => (open = true)));
	 */
	export function searchShortcut(
		open: () => void,
		keys: readonly string[] = SEARCH_KEYS
	): () => void {
		if (typeof window === 'undefined') return () => {};
		const listener = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.isComposing || modals.open) return;
			if (isTypingTarget(event.target)) return;
			if (!keys.some((key) => matchesKey(event, key))) return;
			event.preventDefault();
			open();
		};
		window.addEventListener('keydown', listener);
		return () => window.removeEventListener('keydown', listener);
	}

	/** A title split around the first case-insensitive match of the query, or null for none. */
	function highlight(title: string, query: string): [string, string, string] | null {
		if (!query) return null;
		const at = title.toLowerCase().indexOf(query.toLowerCase());
		if (at < 0) return null;
		const end = at + query.length;
		return [title.slice(0, at), title.slice(at, end), title.slice(end)];
	}
</script>

<!--
@component
SearchPalette — one search for a whole site: a modal with a large field, results grouped by kind
(People, Records, Docs), scope chips with counts ("All 31 · People 4 · Records 23 · Docs 4"), and
the keyboard. A native modal `<dialog>` in the top layer, in the modal stack like Dialog: focus
stays inside, the page cannot scroll, Esc closes it and focus returns to what opened it. On
phones it fills the screen.

The field is a WAI-ARIA 1.2 combobox: focus stays in it, the results are options in a listbox
(one group per kind), and the active row is `aria-activedescendant`. ↑/↓ move across the groups
(wrapping), Enter follows the active row. Every row is a real link, so a click, a middle click or
⌘/Ctrl+Enter opens it in a new tab like any other link.

- `search(query, signal)` returns `SearchGroup[]` (or a promise of them): `{ id, label, items,
  total? }`, each item `{ id, title, href, meta?, icon?, dot?, group? }`. It runs `debounce` ms
  (default 120) after the last keystroke; a newer query aborts the older one's `signal`. A search
  slower than 300ms shows "Searching…"; a quicker one shows nothing in between.
- `open` and `query` (bindable), `label` (default "Search"), `placeholder`, `limit` (rows per group
  under All, default 5; a group with more offers "All N", which scopes to it), `empty` snippet (what
  shows before anything is typed: shortcuts, recent pages), `leading` snippet (a row's leading
  mark, in place of its `icon` or `dot`), `onselect(result)` (a row was chosen), `class`.
- Opening it is the page's job: a Button in the bar, a field-shaped button on an overview page,
  and `searchShortcut` for `/`, ⌘K and Ctrl+K.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	import Button from './Button.svelte';
	import Chip from './Chip.svelte';
	import KeyCap from './KeyCap.svelte';
	import Spinner from './Spinner.svelte';
	import { trackModal } from '../layers.svelte.js';
	import { strings } from '../strings.svelte.js';

	interface Props {
		open?: boolean;
		query?: string;
		search: SearchFn;
		label?: string;
		placeholder?: string;
		limit?: number;
		debounce?: number;
		empty?: Snippet;
		leading?: Snippet<[SearchResult]>;
		onselect?: (result: SearchResult) => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		query = $bindable(''),
		search,
		label = strings.search,
		placeholder = strings.searchPlaceholder,
		limit = 5,
		debounce = 120,
		empty,
		leading,
		onselect,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const listId = `${uid}-list`;
	const optionId = (i: number) => `${uid}-opt-${i}`;

	let input: HTMLInputElement | undefined = $state();
	let pressedScrim = false;

	// The last search's answer, and the query it answered.
	let groups = $state.raw<SearchGroup[]>([]);
	let settled = $state('');
	let failed = $state(false);
	// A search is running; `slow` once it has run for 300ms, which is when "Searching…" shows.
	let pending = $state(false);
	let slow = $state(false);
	// The group the results are scoped to, or null for All.
	let scope = $state<string | null>(null);

	const text = $derived(query.trim());
	const count = (g: SearchGroup) => g.total ?? g.items.length;
	const total = $derived(groups.reduce((n, g) => n + count(g), 0));
	const scoped = $derived(scope !== null && groups.some((g) => g.id === scope) ? scope : null);
	// What shows: every group capped at `limit` under All, or one group whole. `start` is the index
	// of a group's first row in the flat list the keys move through.
	const shown = $derived.by(() => {
		let start = 0;
		return (scoped ? groups.filter((g) => g.id === scoped) : groups).map((group) => {
			const items = scoped ? group.items : group.items.slice(0, Math.max(1, limit));
			const entry = { group, items, start };
			start += items.length;
			return entry;
		});
	});
	const rows = $derived(shown.flatMap((s) => s.items));
	// The first row is active whenever the rows change, so Enter opens the best match.
	let active = $derived(rows.length ? 0 : -1);
	const listed = $derived(!!text && rows.length > 0);
	const announcement = $derived.by(() => {
		if (!text) return '';
		if (slow) return strings.searching;
		if (settled !== text || pending) return '';
		if (failed) return strings.searchFailed;
		if (!rows.length) return strings.noResults(text);
		return strings.resultCount(scoped ? count(groups.find((g) => g.id === scoped)!) : total);
	});

	function normalize(list: readonly SearchGroup[]): SearchGroup[] {
		return list
			.filter((g) => g.items.length)
			.map((g) => ({
				...g,
				items: g.items.map((r) => (r.group ? r : { ...r, group: g.id }))
			}));
	}

	// Run the search a beat after the last keystroke; a newer query aborts the older one.
	$effect(() => {
		const q = text;
		const wait = debounce;
		if (!open || !q) {
			pending = false;
			slow = false;
			if (!q) {
				groups = [];
				settled = '';
				failed = false;
			}
			return;
		}
		const controller = new AbortController();
		let slowTimer: ReturnType<typeof setTimeout> | undefined;
		const timer = setTimeout(() => {
			pending = true;
			slowTimer = setTimeout(() => (slow = true), 300);
			const done = () => {
				clearTimeout(slowTimer);
				pending = false;
				slow = false;
				settled = q;
			};
			Promise.resolve()
				.then(() => search(q, controller.signal))
				.then(
					(result) => {
						if (controller.signal.aborted) return;
						groups = normalize(result ?? []);
						failed = false;
						done();
					},
					() => {
						if (controller.signal.aborted) return;
						groups = [];
						failed = true;
						done();
					}
				);
		}, wait);
		return () => {
			controller.abort();
			clearTimeout(timer);
			clearTimeout(slowTimer);
		};
	});

	function close() {
		open = false;
	}

	function setScope(id: string | null) {
		scope = id;
		input?.focus();
	}

	function move(delta: number) {
		const n = rows.length;
		if (!n) return;
		active = active < 0 ? (delta > 0 ? 0 : n - 1) : (active + delta + n) % n;
		document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
	}

	// Enter follows the active row as a click on its link would, so a router takes it; with ⌘,
	// Ctrl or ⇧ it opens in a new tab or window, as a modified click on a link does.
	function follow(event: KeyboardEvent) {
		const result = rows[active];
		if (!result) return;
		event.preventDefault();
		if (event.metaKey || event.ctrlKey || event.shiftKey) {
			onselect?.(result);
			window.open(result.href, '_blank', 'noopener');
			return;
		}
		const link = document.getElementById(optionId(active));
		if (link) link.click();
		else {
			onselect?.(result);
			close();
			location.assign(result.href);
		}
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.isComposing) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			if (!rows.length) return;
			event.preventDefault();
			move(event.key === 'ArrowDown' ? 1 : -1);
		} else if (event.key === 'Enter') {
			follow(event);
		}
	}

	// A plain click on any link inside — a result, or one in the `empty` snippet — closes the
	// palette as the page navigates; a modified click opens a tab and leaves it open.
	function onclick(event: MouseEvent) {
		if (pressedScrim && event.target === event.currentTarget) {
			pressedScrim = false;
			close();
			return;
		}
		pressedScrim = false;
		const link = (event.target as Element | null)?.closest?.('a[href]');
		if (!link) return;
		const index = link.getAttribute('data-index');
		if (index !== null && rows[Number(index)]) onselect?.(rows[Number(index)]);
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		close();
	}

	function surface(dialog: HTMLDialogElement) {
		// The dialog leaves the DOM as it closes, so the browser cannot restore focus itself.
		const returnTo = document.activeElement as HTMLElement | null;
		try {
			dialog.showModal();
		} catch {
			dialog.setAttribute('open', '');
		}
		const untrack = trackModal(dialog);
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		tick().then(() => {
			input?.focus();
			// Reopened over an earlier query: typing replaces it.
			input?.select();
		});
		return () => {
			untrack();
			root.style.overflow = previous;
			if (typeof dialog.close === 'function') dialog.close();
			if (returnTo?.isConnected) returnTo.focus();
		};
	}
</script>

{#if open}
	<dialog
		class="ds-searchpalette {className}"
		aria-label={label}
		aria-modal="true"
		oncancel={(event) => {
			event.preventDefault();
			close();
		}}
		onpointerdown={(event) => (pressedScrim = event.target === event.currentTarget)}
		{onclick}
		{@attach surface}
	>
		<div class="panel">
			<div class="bar">
				<span class="glass"><SearchIcon size={18} aria-hidden="true" /></span>
				<input
					bind:this={input}
					bind:value={query}
					class="input"
					type="text"
					role="combobox"
					autocomplete="off"
					autocapitalize="off"
					spellcheck="false"
					enterkeyhint="go"
					aria-label={label}
					aria-autocomplete="list"
					aria-expanded={listed}
					aria-controls={listed ? listId : undefined}
					aria-activedescendant={listed && active >= 0 ? optionId(active) : undefined}
					{placeholder}
					{onkeydown}
				/>
				{#if slow}<Spinner size={14} />{/if}
				<span class="close">
					<Button variant="icon" icon={X} label={strings.close} onclick={close} />
				</span>
			</div>

			{#if text && (groups.length > 1 || scoped)}
				<div class="scopes" role="group" aria-label={strings.searchScope}>
					<Chip selected={!scoped} count={total.toLocaleString()} onclick={() => setScope(null)}
						>{strings.allResults}</Chip
					>
					{#each groups as g (g.id)}
						<Chip
							selected={scoped === g.id}
							count={count(g).toLocaleString()}
							onclick={() => setScope(g.id)}>{g.label}</Chip
						>
					{/each}
				</div>
			{/if}

			<div class="body">
				{#if !text}
					{#if empty}<div class="empty">{@render empty()}</div>{/if}
				{:else if rows.length}
					<div id={listId} class="results" role="listbox" aria-label={strings.searchResults}>
						{#each shown as s, gi (s.group.id)}
							<div class="group" role="group" aria-labelledby="{uid}-g{gi}">
								<div class="head" role="presentation">
									<span id="{uid}-g{gi}">{s.group.label}</span>
									{#if !scoped && count(s.group) > s.items.length}
										<!-- The scope chip is the keyboard's way to the same place. -->
										<button
											type="button"
											class="all"
											tabindex="-1"
											aria-hidden="true"
											onclick={() => setScope(s.group.id)}>{strings.allCount(count(s.group))}</button
										>
									{/if}
								</div>
								{#each s.items as result, j (result.id)}
									{@const i = s.start + j}
									{@const parts = highlight(result.title, settled)}
									<a
										id={optionId(i)}
										href={result.href}
										class="row"
										role="option"
										aria-selected={i === active}
										tabindex="-1"
										data-index={i}
										onpointermove={() => (active = i)}
									>
										{#if leading}
											<span class="lead">{@render leading(result)}</span>
										{:else if result.icon}
											<span class="lead"><result.icon size={16} aria-hidden="true" /></span>
										{:else if result.dot}
											<span class="lead" aria-hidden="true"
												><span class="dot" style:background="var(--ds-{result.dot})"></span></span
											>
										{/if}
										<span class="title"
											>{#if parts}{parts[0]}<mark>{parts[1]}</mark>{parts[2]}{:else}{result.title}{/if}</span
										>
										{#if result.meta}<span class="meta">{result.meta}</span>{/if}
									</a>
								{/each}
							</div>
						{/each}
					</div>
				{:else if slow}
					<p class="note">{strings.searching}</p>
				{:else if settled === text && !pending}
					<p class="note">{failed ? strings.searchFailed : strings.noResults(text)}</p>
				{/if}
			</div>

			<div class="foot">
				<span class="hint"
					><KeyCap keys="up" hint={false} /><KeyCap keys="down" hint={false} />{strings.moveHint}</span
				>
				<span class="hint"><KeyCap keys="enter" hint={false} />{strings.openHint}</span>
				<span class="hint"><KeyCap keys="escape" hint={false} />{strings.closeHint}</span>
			</div>
			<!-- Announces the result count, or that there is none, as the results change. -->
			<span class="ds-sr-only" aria-live="polite">{announcement}</span>
		</div>
	</dialog>
{/if}

<style>
	/* The dialog element stays untransformed so a fixed element moved into it (the Toaster)
	   still positions against the viewport; the panel carries the surface and the motion. */
	.ds-searchpalette {
		--palette-max: 70vh;
		width: min(640px, calc(100vw - 32px));
		max-width: none;
		max-height: var(--palette-max);
		margin: 10vh auto auto;
		padding: 0;
		overflow: visible;
		border: 0;
		background: transparent;
		color: var(--ds-text-1);
	}
	.ds-searchpalette::backdrop {
		background: var(--ds-scrim);
	}
	.ds-searchpalette:focus {
		outline: none;
	}
	.panel {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		max-height: var(--palette-max);
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-lg);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		animation: ds-pop var(--ds-dur-base) var(--ds-ease-out);
	}
	.bar {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
		flex: none;
		padding-right: 8px;
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	.glass {
		position: absolute;
		left: 16px;
		display: inline-flex;
		color: var(--ds-text-3);
		pointer-events: none;
	}
	.input {
		flex: 1;
		min-width: 0;
		height: 52px;
		padding: 0 8px 0 46px;
		border: 0;
		border-radius: var(--ds-radius-lg) var(--ds-radius-lg) 0 0;
		background: transparent;
		color: var(--ds-text-1);
		font: inherit;
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
	}
	.input::placeholder {
		color: var(--ds-text-3);
	}
	/* The field is focused the whole time the palette is open: the ring sits inside the panel. */
	.input:focus-visible {
		outline-offset: -2px;
	}
	.close {
		display: none;
	}
	.scopes {
		display: flex;
		gap: 6px;
		flex: none;
		padding: 8px 12px;
		overflow-x: auto;
		border-bottom: 1px solid var(--ds-border-subtle);
		scrollbar-width: none;
	}
	@media (pointer: coarse) {
		.scopes {
			gap: 8px;
		}
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.results {
		padding: 4px;
	}
	.group + .group {
		margin-top: 4px;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 8px 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-weight: 500;
		line-height: var(--ds-lh-xs);
	}
	.all {
		padding: 0 4px;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-accent-text);
		font: inherit;
		cursor: pointer;
	}
	.all:hover {
		text-decoration: underline;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 36px;
		padding: 0 8px;
		border-radius: var(--ds-radius-sm);
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		text-decoration: none;
	}
	.row[aria-selected='true'] {
		background: var(--ds-bg-5);
	}
	.lead {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 16px;
		color: var(--ds-text-3);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--ds-radius-full);
	}
	.title {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* The match: the title's own color, at 500, underlined in the accent. */
	mark {
		background: transparent;
		color: inherit;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: var(--ds-accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 3px;
	}
	.meta {
		flex: none;
		max-width: 40%;
		overflow: hidden;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* ds-text-3 holds its contrast up to ds-bg-3; the active row's ground takes the next step. */
	.row[aria-selected='true'] .meta {
		color: var(--ds-text-2);
	}
	.empty {
		padding: 12px 16px;
	}
	.note {
		margin: 0;
		padding: 16px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.foot {
		display: flex;
		align-items: center;
		gap: 16px;
		flex: none;
		padding: 8px 16px;
		border-top: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.hint {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	/* The key hints follow the viewer's hint preference, like every hint cap. */
	:global(html[data-hints='off']) .foot {
		display: none;
	}
	@media (pointer: coarse) {
		.row {
			min-height: var(--ds-h-touch);
		}
	}
	/* Phones: the palette is the whole screen, with a close button for want of an Esc key. */
	@media (max-width: 767.98px) {
		.ds-searchpalette {
			--palette-max: 100dvh;
			width: 100%;
			height: 100dvh;
			margin: 0;
		}
		.panel {
			height: 100%;
			padding-top: env(safe-area-inset-top, 0px);
			padding-bottom: env(safe-area-inset-bottom, 0px);
			border: 0;
			border-radius: 0;
			animation: ds-fade var(--ds-dur-base) var(--ds-ease-out);
		}
		.input {
			border-radius: 0;
		}
		.close {
			display: inline-flex;
		}
		.row {
			min-height: var(--ds-h-touch);
		}
		.foot {
			display: none;
		}
	}
</style>
