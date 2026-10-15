// The modal stack and the top-layer policy.
//
// While a native modal `<dialog>` is open (`showModal()`), the HTML spec makes everything outside
// the topmost modal dialog's subtree inert — including fixed elements with a higher z-index and
// popovers shown later. A popover can be drawn above a modal, but it still cannot be clicked or
// focused, because inertness follows the DOM tree, not the paint order. The only spec-correct way
// to keep something usable above a modal is to make it a descendant of that modal.
//
// So every darksite surface that calls `showModal()` registers here, and `topmost` moves an
// element into the topmost open modal while one is open and back to its own place when none is.
// A modal dialog renders in the top layer, so a `position: fixed` descendant still positions
// against the viewport, as long as the dialog itself has no transform, filter or containment —
// which is why Dialog and Sheet animate their inner panel, not the dialog element.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';

interface ModalEntry {
	el: HTMLElement;
	dirty: () => boolean;
}

export interface TrackModalOptions {
	/** Read on demand: whether this modal holds unsaved edits. Reactive when it reads state. */
	dirty?: () => boolean;
}

class ModalStack {
	#stack = $state.raw<ModalEntry[]>([]);

	/** How many modal surfaces are open. */
	get count(): number {
		return this.#stack.length;
	}

	/** Whether any modal (Dialog, Sheet, or one registered with `trackModal`) is open. */
	get open(): boolean {
		return this.#stack.length > 0;
	}

	/** Whether any open modal says it holds unsaved edits. */
	get dirty(): boolean {
		return this.#stack.some((entry) => entry.dirty());
	}

	/** The topmost open modal element, or null. */
	get top(): HTMLElement | null {
		return this.#stack.at(-1)?.el ?? null;
	}

	/** @internal Use `trackModal`. */
	add(entry: ModalEntry) {
		// Untracked: a surface registers from inside its own effect, which must not depend on the
		// stack it writes.
		untrack(() => (this.#stack = [...this.#stack.filter((e) => e.el !== entry.el), entry]));
	}

	/** @internal Use the function `trackModal` returns. */
	remove(entry: ModalEntry) {
		untrack(() => (this.#stack = this.#stack.filter((e) => e !== entry)));
	}
}

/** Read-only, reactive view of the open modals: `modals.open`, `modals.count`, `modals.dirty`. */
export const modals = new ModalStack();

/**
 * Registers an open modal surface — call it right after `showModal()` on a dialog of your own.
 * Dialog and Sheet already do. Returns the function that unregisters it; call that on close.
 */
export function trackModal(el: HTMLElement, options: TrackModalOptions = {}): () => void {
	const entry: ModalEntry = { el, dirty: options.dirty ?? (() => false) };
	modals.add(entry);
	return () => modals.remove(entry);
}

/**
 * Keeps an element visible and usable above any open modal by moving it into the topmost open
 * modal dialog, and back to where it was when none is open. The Toaster uses it; use it for an
 * app-level notice that must stay reachable — an update prompt, a lost-connection notice.
 *
 * Attach it to an element whose parent is a plain element you render, not to a component's or a
 * block's first or last node: the element travels, a placeholder keeps its place.
 */
export const topmost: Attachment<HTMLElement> = (el) => {
	const host = modals.top;
	if (!host || !el.parentNode || host === el || el.contains(host) || host.contains(el)) return;
	const marker = document.createComment('ds-topmost');
	el.before(marker);
	host.append(el);
	return () => {
		// Removed by its owner while away: drop the placeholder. Otherwise go back to it — whether
		// the modal is still open, was closed and removed with the element inside, or the owner's
		// own container went away (then the element leaves with it).
		if (el.parentNode === null) marker.remove();
		else marker.replaceWith(el);
	};
};
