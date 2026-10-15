<script lang="ts" module>
	export interface ComboboxItem {
		value: string;
		label: string;
		/** The muted right-hand note: a count, a kind. */
		meta?: string;
		disabled?: boolean;
	}
</script>

<!--
@component
Combobox — pick from many, or create. The system's one typeahead. A WAI-ARIA 1.2 combobox: the
input keeps focus, rows are options in a listbox, the active row is `aria-activedescendant`.
↑/↓ move (wrapping), Enter picks, ⇧Enter creates, Esc and Tab close. Esc is swallowed only while
the list is open.

- `items` (`{ value, label, meta?, disabled? }[]`), `value` (bindable input text),
  `onselect(item)`, `clearOnSelect` (default true; false leaves the label in the input).
- `oncreate(text)` adds a `Create "…"` row, always last; `createLabel(text)` words it.
- Server search: `filter={false}`, `oninput(text)`, `loading`, and feed results back as `items`.
- `placeholder`, `label`, `id` / `describedBy` / `invalid` (from Field), `disabled`, `size`,
  `openOnFocus`, `emptyText`, `element` (bindable), `trailing` snippet, `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { autoUpdate, computePosition, flip, offset, size as sizeTo } from '@floating-ui/dom';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';

	import KeyCap from './KeyCap.svelte';
	import Spinner from './Spinner.svelte';

	interface Props {
		items: readonly ComboboxItem[];
		value?: string;
		onselect?: (item: ComboboxItem) => void;
		clearOnSelect?: boolean;
		oncreate?: (text: string) => void;
		createLabel?: (text: string) => string;
		oninput?: (text: string) => void;
		filter?: boolean;
		loading?: boolean;
		placeholder?: string;
		label?: string;
		id?: string;
		describedBy?: string;
		invalid?: boolean;
		disabled?: boolean;
		size?: 'dense' | 'default';
		openOnFocus?: boolean;
		emptyText?: string;
		element?: HTMLInputElement;
		trailing?: Snippet;
		class?: string;
	}

	let {
		items,
		value = $bindable(''),
		onselect,
		clearOnSelect = true,
		oncreate,
		createLabel = strings.create,
		oninput,
		filter = true,
		loading = false,
		placeholder,
		label,
		id,
		describedBy,
		invalid = false,
		disabled = false,
		size = 'default',
		openOnFocus = false,
		emptyText = strings.noMatches,
		element = $bindable(),
		trailing,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const listId = `${uid}-list`;
	const topLayer = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

	let open = $state(false);
	let active = $state(-1);
	let wrap: HTMLDivElement | undefined = $state();

	const text = $derived((value ?? '').trim());
	const shown = $derived(
		filter && text
			? items.filter((i) => i.label.toLowerCase().includes(text.toLowerCase()))
			: [...items]
	);
	const canCreate = $derived(
		!!oncreate && !!text && !items.some((i) => i.label.toLowerCase() === text.toLowerCase())
	);
	// Rows in order; the create row, when present, is always last.
	const count = $derived(shown.length + (canCreate ? 1 : 0));
	const optionId = (i: number) => `${uid}-opt-${i}`;
	const announcement = $derived(
		!open || loading
			? ''
			: shown.length
				? strings.optionCount(shown.length)
				: canCreate
					? createLabel(text)
					: emptyText
	);

	function show() {
		if (disabled) return;
		open = true;
		if (active >= count) active = -1;
	}

	function close() {
		open = false;
		active = -1;
	}

	function move(delta: number) {
		if (!count) return;
		let next = active;
		for (let n = 0; n < count; n++) {
			next = next < 0 ? (delta > 0 ? 0 : count - 1) : (next + delta + count) % count;
			if (next >= shown.length || !shown[next].disabled) break;
		}
		active = next;
		document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
	}

	function pick(item: ComboboxItem) {
		if (item.disabled) return;
		value = clearOnSelect ? '' : item.label;
		close();
		onselect?.(item);
	}

	function create() {
		if (!canCreate) return;
		const t = text;
		value = '';
		close();
		oncreate?.(t);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) show();
			move(event.key === 'ArrowDown' ? 1 : -1);
		} else if (event.key === 'Enter') {
			if (!open) return;
			if (event.shiftKey && canCreate) {
				event.preventDefault();
				create();
			} else if (active >= 0 && active < shown.length) {
				event.preventDefault();
				pick(shown[active]);
			} else if (active === shown.length && canCreate) {
				event.preventDefault();
				create();
			}
		} else if (event.key === 'Escape') {
			if (!open) return;
			event.preventDefault();
			event.stopPropagation();
			close();
		} else if (event.key === 'Tab') {
			close();
		}
	}

	function surface(el: HTMLElement) {
		if (topLayer) el.showPopover();
		let stop = () => {};
		if (wrap && typeof ResizeObserver !== 'undefined') {
			const anchor = wrap;
			stop = autoUpdate(anchor, el, () => {
				computePosition(anchor, el, {
					placement: 'bottom-start',
					strategy: 'fixed',
					middleware: [
						offset(4),
						flip(),
						sizeTo({
							apply({ rects }) {
								el.style.width = `${rects.reference.width}px`;
							}
						})
					]
				}).then(({ x, y }) => {
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
				});
			});
		}
		return stop;
	}
</script>

<div bind:this={wrap} class="ds-combobox {className}" data-size={size}>
	<input
		bind:this={element}
		bind:value
		id={inputId}
		class="ds-control"
		type="text"
		role="combobox"
		autocomplete="off"
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={open ? listId : undefined}
		aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
		aria-label={label}
		aria-describedby={describedBy}
		aria-invalid={invalid ? 'true' : undefined}
		{placeholder}
		{disabled}
		oninput={() => {
			show();
			active = -1;
			oninput?.(value);
		}}
		onfocus={() => openOnFocus && show()}
		onblur={close}
		{onkeydown}
	/>
	<span class="end">
		{#if loading}<Spinner size={14} label={strings.searching} />{/if}
		{@render trailing?.()}
		<button
			type="button"
			class="chevron"
			tabindex="-1"
			aria-label={open ? strings.hideOptions : strings.showOptions}
			{disabled}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => {
				if (open) close();
				else {
					show();
					element?.focus();
				}
			}}
		>
			<ChevronDown size={16} aria-hidden="true" />
		</button>
	</span>
</div>
<!-- Announces how many options match, or that none do, as the list changes. -->
<span class="ds-sr-only" aria-live="polite">{announcement}</span>

{#if open}
	<ul
		id={listId}
		class="list"
		role="listbox"
		aria-label={label}
		popover={topLayer ? 'manual' : undefined}
		{@attach surface}
	>
		{#each shown as item, i (item.value)}
			<!-- svelte-ignore a11y_click_events_have_key_events (the input owns the keys: aria-activedescendant) -->
			<li
				id={optionId(i)}
				role="option"
				class="option"
				aria-selected={i === active}
				aria-disabled={item.disabled ? 'true' : undefined}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => pick(item)}
				onmousemove={() => !item.disabled && (active = i)}
			>
				<span class="label">{item.label}</span>
				{#if item.meta}<span class="meta">{item.meta}</span>{/if}
			</li>
		{/each}
		{#if !shown.length && !canCreate}
			<li class="empty" role="presentation" aria-hidden="true">{loading ? strings.searching : emptyText}</li>
		{/if}
		{#if canCreate}
			{#if shown.length}<li class="sep" role="presentation"></li>{/if}
			<!-- svelte-ignore a11y_click_events_have_key_events (the input owns the keys: aria-activedescendant) -->
			<li
				id={optionId(shown.length)}
				role="option"
				class="option create"
				aria-selected={active === shown.length}
				onmousedown={(e) => e.preventDefault()}
				onclick={create}
				onmousemove={() => (active = shown.length)}
			>
				<Plus size={14} aria-hidden="true" />
				<span class="label">{createLabel(text)}</span>
				<KeyCap keys="shift+enter" decorative />
			</li>
		{/if}
	</ul>
{/if}

<style>
	.ds-combobox {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.ds-combobox input {
		padding-right: 36px;
	}
	@media (pointer: fine) {
		[data-size='dense'] input {
			height: var(--ds-h-dense);
		}
	}
	.end {
		position: absolute;
		right: 4px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.chevron {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-3);
		cursor: pointer;
	}
	.chevron:hover {
		color: var(--ds-text-1);
	}
	.list {
		position: fixed;
		inset: auto;
		z-index: var(--ds-z-popover);
		max-height: 280px;
		margin: 0;
		padding: 4px;
		overflow: auto;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		color: var(--ds-text-1);
		list-style: none;
	}
	.option {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		padding: 0 8px;
		border-radius: var(--ds-radius-sm);
		font-size: var(--ds-text-md);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.option {
			min-height: 44px;
		}
	}
	.option[aria-selected='true'] {
		background: var(--ds-bg-5);
	}
	.option[aria-disabled='true'] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		flex: none;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
	.create {
		color: var(--ds-accent-text);
	}
	.sep {
		height: 1px;
		margin: 4px 0;
		background: var(--ds-border-subtle);
	}
	.empty {
		padding: 8px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	/* Touch: the chevron is the way to open the list without typing, so it gets a full target. */
	@media (pointer: coarse) {
		.ds-combobox input {
			padding-right: 48px;
		}
		.chevron {
			width: 44px;
			height: 44px;
		}
		.end {
			right: 0;
		}
	}
	.option[aria-selected='true'] .meta {
		color: var(--ds-text-2);
	}
</style>
