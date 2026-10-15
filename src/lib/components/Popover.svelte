<script lang="ts" module>
	export interface PopoverTriggerAttrs {
		id: string;
		'aria-haspopup': 'dialog';
		'aria-expanded': boolean;
		'aria-controls': string | undefined;
		onclick: (event: MouseEvent) => void;
	}
</script>

<!--
@component
Popover — reference info beside the work: a hotkey legend, saved views, an account panel. Non-modal:
the page keeps its keys and its pointer. Esc or an outside click closes it. Under 768px it
presents as a Sheet. A list of actions is a Menu instead.

- `trigger` snippet — spread its attributes onto your trigger:
  `{#snippet trigger(attrs)}<Button {...attrs}>Views</Button>{/snippet}`.
- `open` (bindable; set it from code and it opens anchored to the trigger), `title`, `label` (the
  name when there is no title), `placement` (default `bottom-end`), `width` (default `320px`),
  `sheetOnPhone` (default true), `closeOnOutside` (default true), `class`, children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';

	import Sheet from './Sheet.svelte';

	interface Props {
		trigger: Snippet<[PopoverTriggerAttrs]>;
		open?: boolean;
		title?: string;
		label?: string;
		placement?: Placement;
		width?: string;
		sheetOnPhone?: boolean;
		closeOnOutside?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		trigger,
		open = $bindable(false),
		title,
		label,
		placement = 'bottom-end',
		width = '320px',
		sheetOnPhone = true,
		closeOnOutside = true,
		class: className = '',
		children
	}: Props = $props();

	const uid = $props.id();
	const triggerId = `${uid}-trigger`;
	const panelId = `${uid}-panel`;
	const topLayer = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

	let phone = $state(false);
	$effect(() => {
		const mq = window.matchMedia?.('(max-width: 767.98px)');
		if (!mq) return;
		phone = mq.matches;
		const update = () => (phone = mq.matches);
		mq.addEventListener?.('change', update);
		return () => mq.removeEventListener?.('change', update);
	});
	const asSheet = $derived(sheetOnPhone && phone);

	function close(returnFocus = true) {
		if (!open) return;
		open = false;
		if (returnFocus) document.getElementById(triggerId)?.focus();
	}

	const attrs: PopoverTriggerAttrs = $derived({
		id: triggerId,
		'aria-haspopup': 'dialog',
		'aria-expanded': open,
		'aria-controls': open ? panelId : undefined,
		onclick: () => (open ? close(false) : (open = true))
	});

	function surface(el: HTMLElement) {
		if (topLayer) el.showPopover();
		const anchor = document.getElementById(triggerId);
		let stop = () => {};
		if (anchor && typeof ResizeObserver !== 'undefined') {
			stop = autoUpdate(anchor, el, () => {
				computePosition(anchor, el, {
					placement,
					strategy: 'fixed',
					middleware: [offset(6), flip(), shift({ padding: 8 })]
				}).then(({ x, y }) => {
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
				});
			});
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			event.preventDefault();
			close();
		};
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (closeOnOutside && !el.contains(target) && !anchor?.contains(target)) close(false);
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onPointerDown, true);
		return () => {
			stop();
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onPointerDown, true);
		};
	}
</script>

{@render trigger(attrs)}

{#if asSheet}
	<Sheet bind:open title={title ?? label ?? ''} onclose={() => document.getElementById(triggerId)?.focus()}>
		{@render children()}
	</Sheet>
{:else if open}
	<div
		id={panelId}
		class="ds-popover {className}"
		role="dialog"
		aria-labelledby={title ? `${uid}-title` : undefined}
		aria-label={title ? undefined : label}
		popover={topLayer ? 'manual' : undefined}
		style:width
		{@attach surface}
	>
		{#if title}<h2 id="{uid}-title" class="title">{title}</h2>{/if}
		{@render children()}
	</div>
{/if}

<style>
	.ds-popover {
		position: fixed;
		inset: auto;
		z-index: 60;
		max-width: calc(100vw - 16px);
		max-height: min(70dvh, 640px);
		margin: 0;
		padding: 12px;
		overflow: auto;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		color: var(--ds-text-1);
		animation: ds-fade var(--ds-dur-fast) var(--ds-ease-out);
	}
	.title {
		margin: 0 0 8px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-weight: 500;
	}
</style>
