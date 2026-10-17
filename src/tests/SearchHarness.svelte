<script lang="ts">
	import { Button, SearchPalette, searchShortcut, type SearchFn, type SearchGroup } from '#lib';

	interface Props {
		search?: SearchFn;
		debounce?: number;
		limit?: number;
		onselect?: (result: unknown) => void;
		shortcut?: boolean;
	}

	const groups: SearchGroup[] = [
		{
			id: 'people',
			label: 'People',
			items: [
				{ id: 'p1', title: 'A. Rivera', href: '#people/rivera', meta: 'Field team' },
				{
					id: 'p2',
					title: 'Ada Lovelace',
					href: '#people/lovelace',
					meta: 'Analysis',
					dot: 'success'
				},
				{ id: 'p3', title: 'Grace Hopper', href: '#people/hopper', meta: 'Compilers' }
			]
		},
		{
			id: 'records',
			label: 'Records',
			items: Array.from({ length: 7 }, (_, i) => ({
				id: `r${i}`,
				title: `Record R-0041${i} annex`,
				href: `#records/${i}`,
				meta: `R-0041${i}`
			}))
		},
		{
			id: 'docs',
			label: 'Docs',
			items: [{ id: 'd1', title: 'Getting started', href: '#docs/start', meta: 'Guide' }]
		}
	];

	const local: SearchFn = (query) => {
		const q = query.toLowerCase();
		return groups.map((g) => ({
			...g,
			items: g.items.filter((r) => r.title.toLowerCase().includes(q))
		}));
	};

	let { search = local, debounce = 0, limit, onselect, shortcut = false }: Props = $props();
	let open = $state(false);
	let query = $state('');

	$effect(() => (shortcut ? searchShortcut(() => (open = true)) : undefined));
</script>

<Button onclick={() => (open = true)}>Open search</Button>
<input aria-label="Elsewhere" />
<output data-testid="state">{open ? 'open' : 'closed'}:{query}</output>
<SearchPalette
	bind:open
	bind:query
	{search}
	{debounce}
	{limit}
	{onselect}
	placeholder="Search people, records, docs"
>
	{#snippet empty()}
		<a href="#docs/start">Getting started</a>
	{/snippet}
</SearchPalette>
