<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Search from '@lucide/svelte/icons/search';
	import UserRound from '@lucide/svelte/icons/user-round';
	import {
		Button,
		KeyCap,
		PageHeader,
		SearchPalette,
		searchShortcut,
		Switch,
		type SearchFn,
		type SearchGroup,
		type SearchResult
	} from '#lib';

	// A neutral in-memory dataset: people, records and docs.
	const people: SearchResult[] = [
		'Ada Lovelace',
		'Grace Hopper',
		'A. Rivera',
		'B. Okafor',
		'C. Lindqvist',
		'D. Haddad',
		'E. Moreau',
		'F. Nakamura'
	].map((name, i) => ({
		id: `p${i}`,
		title: name,
		href: `#people/${i}`,
		meta: ['Field team', 'Analysis', 'Operations', 'Support'][i % 4],
		icon: UserRound
	}));
	const tones = ['success', 'warning', 'danger', 'accent'];
	const states = ['Open', 'In review', 'Blocked', 'Scheduled'];
	const records: SearchResult[] = Array.from({ length: 40 }, (_, i) => ({
		id: `r${i}`,
		title: `R-${String(412 + i * 7).padStart(5, '0')} ${['North annex', 'South wing', 'Roof access', 'Garage', 'Lobby'][i % 5]}`,
		href: `#records/${i}`,
		meta: states[i % 4],
		dot: tones[i % 4]
	}));
	const docs: SearchResult[] = [
		['Getting started', 'Guide'],
		['Importing records', 'Guide'],
		['Roles and access', 'Reference'],
		['Record states', 'Reference'],
		['Keyboard shortcuts', 'Reference'],
		['Exporting a report', 'How-to']
	].map(([title, kind], i) => ({
		id: `d${i}`,
		title,
		href: `#docs/${i}`,
		meta: kind,
		icon: FileText
	}));

	let slow = $state(false);
	const wait = (ms: number, signal: AbortSignal) =>
		new Promise<void>((resolve, reject) => {
			const t = setTimeout(resolve, ms);
			signal.addEventListener('abort', () => (clearTimeout(t), reject(signal.reason)));
		});

	const search: SearchFn = async (query, signal) => {
		if (slow) await wait(700, signal);
		const q = query.toLowerCase();
		const match = (list: SearchResult[]) => list.filter((r) => r.title.toLowerCase().includes(q));
		const groups: SearchGroup[] = [
			{ id: 'people', label: 'People', items: match(people) },
			{ id: 'records', label: 'Records', items: match(records) },
			{ id: 'docs', label: 'Docs', items: match(docs) }
		];
		return groups;
	};

	let open = $state(false);
	let query = $state('');
	let chosen = $state('');

	// ⌘K and Ctrl+K open it here; `/` is the gallery's own component search.
	$effect(() => searchShortcut(() => (open = true), ['meta+k', 'ctrl+k']));
</script>

<svelte:head><title>SearchPalette · darksite</title></svelte:head>
<PageHeader title="SearchPalette" />
<div class="demo">
	<h2>In the bar</h2>
	<div class="bar">
		<span class="product">Acme</span>
		<span class="grow"></span>
		<Button variant="ghost" icon={Search} keycap="meta+k" onclick={() => (open = true)}
			>Search</Button
		>
	</div>

	<h2>On an overview page</h2>
	<button type="button" class="ds-control field" onclick={() => (open = true)}>
		<Search size={16} aria-hidden="true" />
		<span class="prompt">Search people, records and docs</span>
		<KeyCap keys="meta+k" decorative />
	</button>

	<h2>Try it</h2>
	<div class="stack">
		<Switch bind:checked={slow} label="Slow search (700ms)" />
	</div>
	<p>
		Type "r", "ada" or "guide". ↑/↓ move across the groups, Enter opens, ⌘Enter opens in a new tab,
		Esc closes. A chip scopes the results to one group; under All each group shows five.
	</p>
	<p class="out">query: {query || '—'} · chosen: {chosen || '—'}</p>
</div>

<SearchPalette
	bind:open
	bind:query
	{search}
	placeholder="Search people, records and docs"
	onselect={(r) => (chosen = r.title)}
>
	{#snippet empty()}
		<div class="shortcuts">
			<p class="title">Jump to</p>
			<a href="#records">Open records</a>
			<a href="#docs/0">Getting started</a>
			<a href="#people">Everyone</a>
		</div>
	{/snippet}
</SearchPalette>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 12px;
		max-width: 640px;
		height: 56px;
		padding: 0 16px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
	}
	.product {
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	.grow {
		flex: 1;
	}
	/* A field-shaped button: the system's control look, laid out as a search field. */
	.field {
		display: flex;
		align-items: center;
		gap: 8px;
		max-width: 520px;
		height: var(--ds-h-comfy);
		color: var(--ds-text-3);
		text-align: start;
		cursor: pointer;
	}
	.field:hover {
		border-color: var(--ds-border-strong);
	}
	.prompt {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.shortcuts .title {
		margin: 0 0 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-weight: 500;
	}
	.shortcuts a {
		color: var(--ds-accent-text);
		font-size: var(--ds-text-md);
	}
</style>
