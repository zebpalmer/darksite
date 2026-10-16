// The collapsed form of the shell's header actions, shared by their two hosts (PageHeader, and the
// TopBar when no page header claims them): an icon button that opens a full-width row. The key
// opens it too; Esc inside the row, a navigation, or the end of the collapsed form closes it.
// Internal.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';

import { isTypingTarget, matchesKey } from './keycap.js';
import type { HeaderActionsContext } from './shell-context.js';

export class ShellFold {
	/** Whether the row is open. */
	open = $state(false);
	readonly #toggleEl: () => HTMLElement | null | undefined;

	/** Call during component init. `folded` says whether the actions are in their collapsed form;
	 *  `toggleEl` finds the button that focus returns to. */
	constructor(
		shell: HeaderActionsContext | undefined,
		folded: () => boolean,
		toggleEl: () => HTMLElement | null | undefined
	) {
		this.#toggleEl = toggleEl;

		// A navigation (the shell's `current` changes), or leaving the collapsed form, closes the row.
		$effect(() => {
			void shell?.current;
			void folded();
			untrack(() => (this.open = false));
		});

		// The field is behind the toggle: the shortcut opens the row, which focuses it.
		$effect(() => {
			const key = shell?.key;
			if (!folded() || this.open || !key) return;
			const listener = (event: KeyboardEvent) => {
				if (event.defaultPrevented || isTypingTarget(event.target) || !matchesKey(event, key))
					return;
				event.preventDefault();
				this.open = true;
			};
			window.addEventListener('keydown', listener);
			return () => window.removeEventListener('keydown', listener);
		});
	}

	toggle = () => {
		this.open = !this.open;
	};

	close = () => {
		this.open = false;
		this.#toggleEl()?.focus();
	};

	/** Esc inside the row closes it, unless something inside (an open list) already took the key. */
	escapeCloses: Attachment<HTMLElement> = (row) => {
		const onkeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			event.preventDefault();
			this.close();
		};
		row.addEventListener('keydown', onkeydown);
		return () => row.removeEventListener('keydown', onkeydown);
	};

	/** Opening the row moves focus into it: the first field, or else the first control. */
	focusFirst: Attachment<HTMLElement> = (row) => {
		const target =
			row.querySelector<HTMLElement>('input, select, textarea, [contenteditable="true"]') ??
			row.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');
		target?.focus();
	};
}
