<!--
@component
SideNav — navigation inside a section: settings, an admin area, a multi-page flow. 200px beside
the page — never a tab strip above it — sticky, with its own scroll: 32px rows and 11px uppercase
group titles; active = ds-bg-4 + ds-text-1 + a 2px accent bar.

Below 768px it is a full-width native `<select>` with optgroups: the one control every phone
renders well. Choosing a page calls `onnavigate(href)` — pass the router's navigation (SvelteKit's
`goto`); without it the browser loads the page.

- `items` (`NavItem[]` with `group`; an item's `description` is its tooltip), `groups` (a group's
  `collapsed` sets how it starts), `current`, `label`, `collapsible` (each group is a disclosure;
  one without the current page starts closed unless its `collapsed` is false), `onnavigate`.

A few sibling views of the same data that need the full width use Tabs instead (which-primitive).
-->
<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { badgeSpoken, badgeText, groupItems, type NavGroup, type NavItem } from '../nav.js';
	import { tooltip } from '../tooltip.js';

	interface Props {
		items: readonly NavItem[];
		groups?: readonly NavGroup[];
		current?: string;
		label: string;
		collapsible?: boolean;
		onnavigate?: (href: string) => void;
		class?: string;
	}

	let { items, groups = [], current, label, collapsible = false, onnavigate, class: className = '' }: Props =
		$props();

	const uid = $props.id();
	const sections = $derived(groupItems(items, groups));
	const currentHref = $derived(items.find((i) => i.id === current)?.href ?? '');
	let closed = $state<Record<string, boolean>>({});
	// Until the viewer toggles a group, it is open when it holds the current page, or when the
	// group asks to start open. Items outside any group have no toggle, so they are always shown.
	const isOpen = (id: string, group: NavGroup | null, list: NavItem[]) =>
		!collapsible ||
		!group ||
		(closed[id] === undefined
			? list.some((i) => i.id === current) || group?.collapsed === false
			: !closed[id]);

	function go(href: string) {
		if (!href) return;
		if (onnavigate) onnavigate(href);
		else window.location.assign(href);
	}
</script>

<nav class="ds-sidenav {className}" aria-label={label}>
	{#each sections as section (section.group?.id ?? '_')}
		{@const id = section.group?.id ?? '_'}
		{@const open = isOpen(id, section.group, section.items)}
		{#if section.group}
			{#if collapsible}
				<button
					type="button"
					class="group toggle"
					aria-expanded={open}
					aria-controls="{uid}-{id}"
					onclick={() => (closed[id] = open)}
				>
					<ChevronRight size={12} aria-hidden="true" />{section.group.label}
				</button>
			{:else}
				<div class="group" id="{uid}-{id}-title">{section.group.label}</div>
			{/if}
		{/if}
		{#if open}
			<ul id="{uid}-{id}" aria-labelledby={section.group && !collapsible ? `${uid}-${id}-title` : undefined}>
				{#each section.items as item (item.id)}
					{@const badge = badgeText(item.badge)}
					<li>
						<a
							href={item.href}
							class="item"
							aria-current={item.id === current ? 'page' : undefined}
							{@attach tooltip(item.description, { placement: 'right' })}
						>
							<span class="label">{item.label}</span>
							{#if badge}<span class="badge" aria-hidden="true">{badge}</span>{/if}
							{#if badge !== null}<span class="ds-sr-only">{badgeSpoken(badge)}</span>{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
</nav>

<div class="ds-sidenav-phone">
	<select class="ds-control" aria-label={label} value={currentHref} onchange={(e) => go(e.currentTarget.value)}>
		{#each sections as section (section.group?.id ?? '_')}
			{#if section.group}
				<optgroup label={section.group.label}>
					{#each section.items as item (item.id)}<option value={item.href}>{item.label}</option>{/each}
				</optgroup>
			{:else}
				{#each section.items as item (item.id)}<option value={item.href}>{item.label}</option>{/each}
			{/if}
		{/each}
	</select>
</div>

<style>
	.ds-sidenav {
		position: sticky;
		top: calc(var(--ds-chrome-top, 0px) + var(--ds-topbar-h, 0px));
		flex: none;
		width: 200px;
		max-height: calc(100dvh - var(--ds-chrome-top, 0px) - var(--ds-topbar-h, 0px));
		overflow-y: auto;
		padding: 8px 0;
	}
	.group {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
		margin-top: 8px;
		padding: 6px 14px 4px;
		border: 0;
		background: transparent;
		color: var(--ds-text-3);
		font-family: var(--font-sans);
		font-size: 11px;
		line-height: 16px;
		letter-spacing: 0.06em;
		text-align: start;
		text-transform: uppercase;
	}
	.group:first-child {
		margin-top: 0;
	}
	.toggle {
		cursor: pointer;
	}
	.toggle[aria-expanded='true'] :global(svg) {
		transform: rotate(90deg);
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
		padding: 0 8px;
		list-style: none;
	}
	.item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 32px;
		padding: 0 8px;
		border-radius: var(--ds-radius-sm);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		text-decoration: none;
	}
	.item:hover {
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
	}
	.item[aria-current='page'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.item[aria-current='page']::before {
		content: '';
		position: absolute;
		left: -8px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		border-radius: 2px;
		background: var(--ds-accent);
	}
	.item:focus-visible {
		outline-offset: -2px;
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.badge {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	.ds-sidenav-phone {
		display: none;
		padding: 12px 16px 0;
	}
	@media (max-width: 767.98px) {
		.ds-sidenav {
			display: none;
		}
		.ds-sidenav-phone {
			display: block;
		}
	}
	@media (pointer: coarse) {
		.item {
			height: 44px;
		}
	}
</style>
