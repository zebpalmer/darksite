<script lang="ts">
	import '#lib/tokens.css';
	import '#lib/base.css';
	import './demo.css';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Bell from '@lucide/svelte/icons/bell';
	import Contrast from '@lucide/svelte/icons/contrast';
	import Heading from '@lucide/svelte/icons/heading';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import ListTree from '@lucide/svelte/icons/list-tree';
	import Moon from '@lucide/svelte/icons/moon';
	import PanelBottom from '@lucide/svelte/icons/panel-bottom';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import PanelTop from '@lucide/svelte/icons/panel-top';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import Sun from '@lucide/svelte/icons/sun';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Palette from '@lucide/svelte/icons/palette';
	import House from '@lucide/svelte/icons/house';
	import FileText from '@lucide/svelte/icons/file-text';
	import Map from '@lucide/svelte/icons/map';
	import SquareMousePointer from '@lucide/svelte/icons/square-mouse-pointer';
	import {
		AppShell,
		Button,
		KeyCap,
		ModePicker,
		MODES,
		mode,
		modeLabel,
		Select,
		toasts,
		type Mode,
		type NavGroup,
		type NavItem
	} from '#lib';
	import { brands, gallery, initBrand, initNav, setBrand, setNav } from './brand.svelte.js';
	import pkg from '../../package.json';
	import { componentHref, findComponent, names } from './catalog.js';
	import { demo } from './demo.svelte.js';

	let { children }: { children: Snippet } = $props();

	// `?theme=light` (or paper, night, contrast) and `?brand=nord` open the gallery that way, for
	// screenshots; otherwise the viewer's saved choices apply.
	$effect(() => {
		mode.init();
		initBrand();
		initNav();
		const t = new URLSearchParams(location.search).get('theme');
		if (t && (MODES as readonly string[]).includes(t)) mode.set(t as Mode, { persist: false });
	});
	const cycle: Mode[] = ['dark', 'light', 'paper', 'night', 'contrast'];
	const nextMode = $derived(cycle[(cycle.indexOf(mode.current) + 1) % cycle.length]);
	const modeIcon = {
		system: Monitor,
		dark: Moon,
		light: Sun,
		paper: BookOpen,
		night: Moon,
		contrast: Contrast
	};

	const groups: NavGroup[] = [
		{ id: 'shell', label: 'Shell' },
		{ id: 'pages', label: 'Page types' }
	];
	const base: NavItem[] = [
		{ id: 'components', label: 'Components', href: '/', icon: LayoutGrid },
		{ id: 'brands', label: 'Brands and modes', href: '/brands', icon: Palette },
		{ id: 'appshell', label: 'AppShell', href: '/appshell', icon: PanelsTopLeft, group: 'shell' },
		{ id: 'navrail', label: 'NavRail', href: '/navrail', icon: PanelLeft, group: 'shell' },
		{ id: 'tabbar', label: 'TabBar', href: '/tabbar', icon: PanelBottom, group: 'shell' },
		{ id: 'sidenav', label: 'SideNav', href: '/sidenav', icon: ListTree, group: 'shell' },
		{ id: 'topbar', label: 'TopBar', href: '/topbar', icon: PanelTop, group: 'shell' },
		{ id: 'pageheader', label: 'PageHeader', href: '/pageheader', icon: Heading, group: 'shell' },
		{
			id: 'actionbar',
			label: 'ActionBar',
			href: '/actionbar',
			icon: SquareMousePointer,
			group: 'shell'
		},
		{ id: 'toaster', label: 'Toaster', href: '/toaster', icon: Bell, group: 'shell' },
		{ id: 'overview', label: 'Overview', href: '/overview', icon: House, group: 'pages' },
		{ id: 'document', label: 'Document', href: '/document', icon: FileText, group: 'pages' },
		{ id: 'fullbleed', label: 'Full bleed', href: '/fullbleed', icon: Map, group: 'pages' }
	];
	const items = $derived(base.map((i) => ({ ...i, badge: demo.badges[i.id] ?? null })));
	const current = $derived(
		base.find((i) => i.href !== '/' && page.url.pathname.startsWith(i.href))?.id ?? 'components'
	);

	// The shell's header search: Enter opens the best-matching component's page.
	let query = $state('');
	function find(event: SubmitEvent) {
		event.preventDefault();
		const name = findComponent(query);
		if (!name) {
			toasts.info(`No component matches "${query.trim()}"`);
			return;
		}
		query = '';
		(document.activeElement as HTMLElement | null)?.blur();
		goto(componentHref(name));
	}
</script>

{#snippet mark()}
	<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
		<rect x="3" y="3" width="18" height="18" rx="4" fill="var(--ds-accent)" />
		<path d="M8 8h5a4 4 0 0 1 0 8H8z" fill="var(--ds-bg-0)" />
	</svg>
{/snippet}

{#snippet headerActions()}
	<form class="find" role="search" onsubmit={find}>
		<label>
			<span class="ds-sr-only">Find a component</span>
			<input
				class="ds-control"
				type="search"
				placeholder="Find a component"
				list="gallery-components"
				aria-keyshortcuts="/"
				bind:value={query}
			/>
			<KeyCap keys="/" decorative />
		</label>
		<datalist id="gallery-components">
			{#each names as name (name)}<option value={name}></option>{/each}
		</datalist>
	</form>
{/snippet}

{#snippet account({ compact }: { compact: boolean })}
	{#if compact}
		<Button
			variant="icon"
			icon={modeIcon[mode.current]}
			label="{modeLabel(mode.current)}. Switch to {modeLabel(nextMode)}"
			onclick={() => mode.set(nextMode)}
		/>
	{:else}
		<div class="prefs">
			<ModePicker />
			<label class="pref">
				<span>Navigation</span>
				<Select
					value={gallery.nav}
					options={[
						{ value: 'rail', label: 'Rail' },
						{ value: 'top', label: 'Top bar' }
					]}
					onchange={(e: Event) =>
						setNav((e.currentTarget as HTMLSelectElement).value as 'rail' | 'top')}
				/>
			</label>
			<label class="pref">
				<span>Brand</span>
				<Select
					value={gallery.brand}
					options={brands.map((b) => ({ value: b.name, label: b.label }))}
					onchange={(e: Event) => setBrand((e.currentTarget as HTMLSelectElement).value)}
				/>
			</label>
		</div>
	{/if}
{/snippet}

{#snippet footer()}
	<div class="foot">
		<span>darksite {pkg.version}</span>
		<a href="https://github.com/zebpalmer/darksite">Source</a>
		<a href="https://github.com/zebpalmer/darksite/blob/main/CHANGELOG.md">Changelog</a>
	</div>
{/snippet}

<AppShell
	nav={gallery.nav}
	{items}
	{groups}
	{current}
	product="darksite"
	{mark}
	{account}
	{footer}
	{headerActions}
	headerActionsLabel="Find a component"
	rememberAs="gallery"
	primaryTabs={['components', 'navrail', 'pageheader', 'toaster']}
>
	{@render children()}
</AppShell>

<style>
	.find {
		width: 240px;
	}
	.find label {
		position: relative;
		display: flex;
		align-items: center;
	}
	.find input {
		width: 100%;
		padding-right: 32px;
	}
	.find :global(.ds-kbd) {
		position: absolute;
		right: 8px;
	}
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 20px;
		padding: 14px 24px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	.prefs {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.pref {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
