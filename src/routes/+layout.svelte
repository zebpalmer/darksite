<script lang="ts">
	import '#lib/tokens.css';
	import '#lib/base.css';
	import './demo.css';
	import type { Snippet } from 'svelte';
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
	import SquareMousePointer from '@lucide/svelte/icons/square-mouse-pointer';
	import { AppShell, Button, type NavGroup, type NavItem } from '#lib';
	import { demo } from './demo.svelte.js';

	let { children }: { children: Snippet } = $props();

	type Theme = 'dark' | 'light' | 'contrast';
	const themes: { id: Theme; label: string; icon: typeof Moon }[] = [
		{ id: 'dark', label: 'Dark', icon: Moon },
		{ id: 'light', label: 'Light', icon: Sun },
		{ id: 'contrast', label: 'High contrast', icon: Contrast }
	];
	let theme = $state<Theme>('dark');

	// `?theme=light` or `?theme=contrast` opens the gallery in that theme, for screenshots.
	$effect(() => {
		const t = new URLSearchParams(location.search).get('theme');
		if (t === 'light' || t === 'contrast') setTheme(t);
	});

	function setTheme(t: Theme) {
		theme = t;
		document.documentElement.dataset.theme = t;
	}

	const groups: NavGroup[] = [{ id: 'shell', label: 'Shell' }];
	const base: NavItem[] = [
		{ id: 'components', label: 'Components', href: '/', icon: LayoutGrid },
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
		{ id: 'toaster', label: 'Toaster', href: '/toaster', icon: Bell, group: 'shell' }
	];
	const items = $derived(base.map((i) => ({ ...i, badge: demo.badges[i.id] ?? null })));
	const current = $derived(
		base.find((i) => i.href !== '/' && page.url.pathname.startsWith(i.href))?.id ?? 'components'
	);
	const next = $derived(themes[(themes.findIndex((t) => t.id === theme) + 1) % themes.length]);
</script>

{#snippet mark()}
	<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
		<rect x="3" y="3" width="18" height="18" rx="4" fill="var(--ds-accent)" />
		<path d="M8 8h5a4 4 0 0 1 0 8H8z" fill="var(--ds-bg-0)" />
	</svg>
{/snippet}

{#snippet account({ compact }: { compact: boolean })}
	{#if compact}
		<Button
			variant="ghost"
			size="dense"
			icon={next.icon}
			aria-label="Theme: {themes.find((t) => t.id === theme)?.label}. Switch to {next.label}"
			onclick={() => setTheme(next.id)}
		/>
	{:else}
		<label class="theme">
			<span>Theme</span>
			<select
				class="ds-control"
				value={theme}
				onchange={(e) => setTheme(e.currentTarget.value as Theme)}
			>
				{#each themes as t (t.id)}<option value={t.id}>{t.label}</option>{/each}
			</select>
		</label>
	{/if}
{/snippet}

<AppShell
	{items}
	{groups}
	{current}
	product="darksite"
	{mark}
	{account}
	rememberAs="gallery"
	primaryTabs={['components', 'navrail', 'pageheader', 'toaster']}
>
	{@render children()}
</AppShell>

<style>
	.theme {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
