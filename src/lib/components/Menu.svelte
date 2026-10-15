<script lang="ts" module>
	import type { IconComponent } from '../types.js';

	export interface MenuAction {
		id: string;
		label: string;
		icon?: IconComponent;
		keycap?: string;
		/** `danger`: activation should open a Dialog rather than act. */
		tone?: 'default' | 'danger';
		/** Stays visible and focusable; `reason` says why it cannot be used. */
		disabled?: boolean;
		reason?: string;
		/** Marks an action that will ask for a note before it runs. */
		needsNote?: boolean;
		onselect?: () => void;
	}
	export type MenuEntry = MenuAction | { separator: true } | { group: string };

	export interface MenuTriggerAttrs {
		id: string;
		'aria-haspopup': 'menu';
		'aria-expanded': boolean;
		'aria-controls': string | undefined;
		onclick: (event: MouseEvent) => void;
		onkeydown: (event: KeyboardEvent) => void;
	}
</script>

<!--
@component
Menu — a short list of actions on a thing: a detail page's Actions menu, a row's overflow menu.
`role="menu"` with `menuitem`s. Non-modal; Esc or an outside click closes it. Under 768px it rises
from the bottom as a sheet with 44px rows.

Keys: ↓ / ↑ move (wrapping), Home / End jump, a letter jumps to the next item starting with it,
Enter or Space activates, Esc closes and returns focus to the trigger, Tab closes.

- `trigger` snippet: receives the attributes to spread onto your Button.
- `items`: actions, `{ separator: true }` and `{ group: 'Title' }` entries, in order.
- A `danger` action opens the Dialog that confirms it; a `disabled` one stays visible with its
  `reason`, because in an actions menu the reason is the useful part.
- `open` (bindable), `placement` (default `bottom-end`), `label` (the menu's accessible name).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick, untrack } from 'svelte';
	import { autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';
	import MessageSquareText from '@lucide/svelte/icons/message-square-text';

	import KeyCap from './KeyCap.svelte';
	import { media } from '../media.svelte.js';

	interface Props {
		trigger: Snippet<[MenuTriggerAttrs]>;
		items: readonly MenuEntry[];
		label: string;
		open?: boolean;
		placement?: Placement;
		class?: string;
	}

	let { trigger, items, label, open = $bindable(false), placement = 'bottom-end', class: className = '' }: Props =
		$props();

	const uid = $props.id();
	const triggerId = `${uid}-trigger`;
	const menuId = `${uid}-menu`;

	type Section = { title?: string; entries: (MenuAction | { separator: true })[] };
	const sections = $derived.by(() => {
		const out: Section[] = [{ entries: [] }];
		for (const entry of items) {
			if ('group' in entry) out.push({ title: entry.group, entries: [] });
			else out[out.length - 1].entries.push(entry);
		}
		return out.filter((s) => s.title || s.entries.length);
	});
	const actions = $derived(items.filter((e): e is MenuAction => 'id' in e));

	// The top layer escapes overflow clipping. Where `popover` is unsupported the menu still works,
	// fixed-positioned in place.
	const topLayer = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

	let focusIndex = $state(0);
	const itemEls: Record<string, HTMLElement> = {};

	function triggerEl() {
		return document.getElementById(triggerId);
	}

	async function show(focus: 'first' | 'last' = 'first') {
		focusIndex = focus === 'first' ? 0 : actions.length - 1;
		open = true;
		await tick();
		focusItem(focusIndex);
	}

	function close(returnFocus = true) {
		if (!open) return;
		open = false;
		if (returnFocus) triggerEl()?.focus();
	}

	function focusItem(index: number) {
		if (!actions.length) return;
		focusIndex = (index + actions.length) % actions.length;
		itemEls[actions[focusIndex].id]?.focus();
	}

	function activate(action: MenuAction) {
		if (action.disabled) return;
		close();
		action.onselect?.();
	}

	const attrs: MenuTriggerAttrs = $derived({
		id: triggerId,
		'aria-haspopup': 'menu',
		'aria-expanded': open,
		'aria-controls': open ? menuId : undefined,
		onclick: () => (open ? close() : show('first')),
		onkeydown: (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				show('first');
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				show('last');
			}
		}
	});

	function onMenuKeydown(event: KeyboardEvent) {
		const key = event.key;
		if (key === 'ArrowDown') {
			event.preventDefault();
			focusItem(focusIndex + 1);
		} else if (key === 'ArrowUp') {
			event.preventDefault();
			focusItem(focusIndex - 1);
		} else if (key === 'Home') {
			event.preventDefault();
			focusItem(0);
		} else if (key === 'End') {
			event.preventDefault();
			focusItem(actions.length - 1);
		} else if (key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			close();
		} else if (key === 'Tab') {
			close(false);
		} else if (key === 'Enter' || key === ' ') {
			event.preventDefault();
			const action = actions[focusIndex];
			if (action) activate(action);
		} else if (key.length === 1 && /\S/.test(key)) {
			const ch = key.toLowerCase();
			for (let step = 1; step <= actions.length; step++) {
				const i = (focusIndex + step) % actions.length;
				if (actions[i].label.toLowerCase().startsWith(ch)) {
					focusItem(i);
					break;
				}
			}
		}
	}

	/** Shows the menu in the top layer, positions it beside the trigger, and closes it on an
	 *  outside press. On phones the stylesheet turns it into a bottom sheet instead. */
	function surface(el: HTMLElement) {
		if (topLayer) el.showPopover();
		const anchor = triggerEl();
		const phone = untrack(() => media.phone);
		let stop = () => {};
		if (anchor && !phone && typeof ResizeObserver !== 'undefined') {
			stop = autoUpdate(anchor, el, () => {
				computePosition(anchor, el, {
					placement,
					strategy: 'fixed',
					middleware: [offset(4), flip(), shift({ padding: 8 })]
				}).then(({ x, y }) => {
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
				});
			});
		}
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!el.contains(target) && !anchor?.contains(target)) close(false);
		};
		document.addEventListener('pointerdown', onPointerDown, true);
		return () => {
			stop();
			document.removeEventListener('pointerdown', onPointerDown, true);
		};
	}
</script>

{@render trigger(attrs)}

{#if open}
	<div
		{@attach surface}
		id={menuId}
		class="ds-menu {className}"
		role="menu"
		aria-label={label}
		tabindex="-1"
		popover={topLayer ? 'manual' : undefined}
		onkeydown={onMenuKeydown}
	>
		{#each sections as section, si (si)}
			{#if si > 0 && !section.title}<div class="sep" role="separator"></div>{/if}
			<div role={section.title ? 'group' : 'none'} aria-label={section.title}>
				{#if section.title}<div class="group" aria-hidden="true">{section.title}</div>{/if}
				{#each section.entries as entry, ei (ei)}
					{#if 'separator' in entry}
						<div class="sep" role="separator"></div>
					{:else}
						{@const index = actions.indexOf(entry)}
						<button
							bind:this={itemEls[entry.id]}
							type="button"
							role="menuitem"
							class="item"
							data-tone={entry.tone ?? 'default'}
							tabindex={index === focusIndex ? 0 : -1}
							aria-disabled={entry.disabled ? 'true' : undefined}
							aria-describedby={entry.disabled && entry.reason ? `${menuId}-${entry.id}-why` : undefined}
							aria-keyshortcuts={entry.keycap}
							title={entry.disabled ? entry.reason : undefined}
							onclick={() => activate(entry)}
							onfocus={() => (focusIndex = index)}
						>
							<span class="icon">{#if entry.icon}<entry.icon size={16} aria-hidden="true" />{/if}</span>
							<span class="label">{entry.label}</span>
							{#if entry.needsNote}
								<span class="note" title="Asks for a note"
									><MessageSquareText size={14} aria-hidden="true" /><span class="ds-sr-only"
										>(asks for a note)</span
									></span
								>
							{/if}
							{#if entry.keycap}<KeyCap keys={entry.keycap} decorative />{/if}
							{#if entry.disabled && entry.reason}
								<span id="{menuId}-{entry.id}-why" class="ds-sr-only">{entry.reason}</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.ds-menu {
		position: fixed;
		inset: auto;
		z-index: var(--ds-z-popover);
		margin: 0;
		min-width: 200px;
		max-width: min(320px, calc(100vw - 16px));
		max-height: min(70dvh, 480px);
		overflow-y: auto;
		padding: 4px;
		border: 0;
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-2);
		color: var(--ds-text-1);
		animation: ds-fade var(--ds-dur-base) var(--ds-ease-out);
	}
	.ds-menu:focus {
		outline: none;
	}
	.group {
		padding: 6px 8px 2px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.sep {
		height: 1px;
		margin: 4px 0;
		background: var(--ds-border-subtle);
	}
	.item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-height: var(--ds-h-default);
		padding: 0 8px;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-text-1);
		font-family: var(--font-sans);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		text-align: start;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.item {
			min-height: var(--ds-h-touch);
		}
	}
	.item:hover,
	.item:focus-visible {
		background: var(--ds-bg-5);
	}
	.item:focus-visible {
		outline-offset: -2px;
	}
	.item[data-tone='danger'] {
		color: var(--ds-danger-text);
	}
	.item[aria-disabled='true'] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.icon {
		display: inline-flex;
		flex: none;
		width: 16px;
		color: var(--ds-text-3);
	}
	.item[data-tone='danger'] .icon {
		color: inherit;
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.note {
		display: inline-flex;
		color: var(--ds-text-3);
	}

	/* Phones: a bottom sheet with 44px rows. */
	@media (max-width: 767.98px) {
		.ds-menu {
			inset: auto 0 0 0;
			width: 100%;
			max-width: none;
			max-height: 78dvh;
			padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
			border-radius: var(--ds-radius-lg) var(--ds-radius-lg) 0 0;
			box-shadow: var(--ds-elev-3);
			animation: ds-rise var(--ds-dur-slow) var(--ds-ease-out);
		}
		.ds-menu::backdrop {
			background: var(--ds-scrim);
		}
		.item {
			min-height: var(--ds-h-touch);
		}
	}
</style>
