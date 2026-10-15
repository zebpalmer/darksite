// A tooltip as an attachment, for any element that is already focusable:
//
//   <Button variant="icon" icon={Copy} label="Copy link" />        — icon buttons get one for free
//   <a href="/r/1" {@attach tooltip('Opened 3 times')}>R-00412</a>
//
// It shows after a short hover, at once on keyboard focus, and on a long press on a touch screen;
// it hides on leaving, blur, Esc or a scroll. The text describes the element (`aria-describedby`)
// unless it is already the element's name, so a screen reader never hears it twice. The bubble is
// in the top layer, placed beside the element and kept inside the viewport.
import { autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';
import type { Attachment } from 'svelte/attachments';

export interface TooltipOptions {
	/** Where it prefers to sit. Default `top`. */
	placement?: Placement;
	/** Hover delay in ms. Default 300. */
	delay?: number;
}

let seq = 0;

export function tooltip(
	text: string | null | undefined,
	options: TooltipOptions = {}
): Attachment<HTMLElement> {
	return (el) => {
		if (!text || typeof document === 'undefined') return;
		const { placement = 'top', delay = 300 } = options;
		const topLayer = 'showPopover' in HTMLElement.prototype;

		const bubble = document.createElement('span');
		bubble.className = 'ds-tooltip';
		bubble.id = `ds-tooltip-${++seq}`;
		bubble.setAttribute('role', 'tooltip');
		bubble.textContent = text;
		bubble.hidden = true;
		if (topLayer) bubble.popover = 'manual';

		const named = el.getAttribute('aria-label') === text || el.textContent?.trim() === text;
		if (named) bubble.setAttribute('aria-hidden', 'true');
		else
			el.setAttribute(
				'aria-describedby',
				[el.getAttribute('aria-describedby'), bubble.id].filter(Boolean).join(' ')
			);
		document.body.append(bubble);

		let timer: ReturnType<typeof setTimeout> | undefined;
		let stop: (() => void) | undefined;

		function show() {
			clearTimeout(timer);
			if (!bubble.hidden) return;
			// Inside an open modal dialog, the bubble has to live there to be seen above it.
			(el.closest('dialog') ?? document.body).append(bubble);
			bubble.hidden = false;
			if (topLayer) bubble.showPopover();
			stop = autoUpdate(el, bubble, () => {
				computePosition(el, bubble, {
					placement,
					strategy: 'fixed',
					middleware: [offset(6), flip(), shift({ padding: 8 })]
				}).then(({ x, y }) => {
					bubble.style.left = `${x}px`;
					bubble.style.top = `${y}px`;
				});
			});
		}

		function hide() {
			clearTimeout(timer);
			if (bubble.hidden) return;
			stop?.();
			if (topLayer && bubble.matches(':popover-open')) bubble.hidePopover();
			bubble.hidden = true;
		}

		const later = (ms: number, fn: () => void) => {
			clearTimeout(timer);
			timer = setTimeout(fn, ms);
		};
		const onenter = (e: PointerEvent) => e.pointerType === 'mouse' && later(delay, show);
		const ondown = (e: PointerEvent) => {
			if (e.pointerType === 'mouse') hide();
			else later(500, show);
		};
		const onup = (e: PointerEvent) =>
			e.pointerType !== 'mouse' && (bubble.hidden ? clearTimeout(timer) : later(1500, hide));
		const onfocus = () => el.matches(':focus-visible') && show();
		const onkey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !bubble.hidden) {
				e.stopPropagation();
				hide();
			}
		};

		el.addEventListener('pointerenter', onenter);
		el.addEventListener('pointerleave', hide);
		el.addEventListener('pointerdown', ondown);
		el.addEventListener('pointerup', onup);
		el.addEventListener('pointercancel', hide);
		el.addEventListener('focus', onfocus);
		el.addEventListener('blur', hide);
		el.addEventListener('keydown', onkey);
		window.addEventListener('scroll', hide, true);

		return () => {
			hide();
			el.removeEventListener('pointerenter', onenter);
			el.removeEventListener('pointerleave', hide);
			el.removeEventListener('pointerdown', ondown);
			el.removeEventListener('pointerup', onup);
			el.removeEventListener('pointercancel', hide);
			el.removeEventListener('focus', onfocus);
			el.removeEventListener('blur', hide);
			el.removeEventListener('keydown', onkey);
			window.removeEventListener('scroll', hide, true);
			if (!named) {
				const rest = (el.getAttribute('aria-describedby') ?? '')
					.split(' ')
					.filter((id) => id && id !== bubble.id)
					.join(' ');
				if (rest) el.setAttribute('aria-describedby', rest);
				else el.removeAttribute('aria-describedby');
			}
			bubble.remove();
		};
	};
}
