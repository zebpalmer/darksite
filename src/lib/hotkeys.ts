// Hotkey binding tables. A view's keys are declarative data — `{ keys, action, label, group }` —
// not a switch statement buried in a component, so the same table drives the handler, the key
// legend and the tests. Key tokens follow the one grammar in `keycap.ts` (`shift+enter`, `g`,
// `?`); matching is `matchesKey`, display is `formatKey`.
//
//   const map = buildHotkeyMap([
//     { keys: ['j', 'down'], action: 'next', label: 'Next record', group: 'Move' },
//     { keys: 'e', action: 'edit', label: 'Edit', group: 'Record', when: () => !!selected },
//     { keys: '?', action: 'legend', label: 'Show shortcuts', group: 'Help' }
//   ]);
//   $effect(() => installHotkeys(map, run));          — page keys, on the window
//   <section tabindex="-1" {@attach hotkeys(map, run)}>  — a pane's keys, while focus is inside
//   <div {@attach focusShortcut('/')}>                    — `/` focuses the first field inside

import type { Attachment } from 'svelte/attachments';

import { isTypingTarget, matchesKey, normalizeKey } from './keycap.js';

export interface HotkeyBinding<A extends string = string> {
	/** One token or several alternatives: `'e'`, `['j', 'down']`. The first is the one a legend
	 *  shows first. */
	keys: string | readonly string[];
	/** The caller's action id. Several bindings may share one. */
	action: A;
	/** What the key does, as a label: `Next record`, `Archive`. Shown in a legend. */
	label: string;
	/** The legend group: `Move`, `Record`, `Help`. */
	group?: string;
	/** Only live while this returns true — a selection exists, a panel is open. A binding with
	 *  `when` may share its key with another binding that has one; the first live one wins. */
	when?: () => boolean;
	/** Still fires while focus is in a text field — `escape` to leave one. Default false. */
	allowWhileTyping?: boolean;
	/** Left out of a legend (a duplicate path to an action already listed). */
	hidden?: boolean;
}

export interface HotkeyConflict<A extends string = string> {
	/** The key, in canonical form (`normalizeKey`). */
	key: string;
	/** Every action claiming it, in table order. */
	actions: A[];
}

export interface HotkeyMap<A extends string = string> {
	readonly bindings: readonly HotkeyBinding<A>[];
	/** Keys claimed by more than one always-live binding. The first claim wins at runtime, but a
	 *  conflict is a bug in the table: test that this is empty. */
	readonly conflicts: readonly HotkeyConflict<A>[];
}

/** A binding's keys as a list. */
export function bindingKeys(binding: Pick<HotkeyBinding, 'keys'>): string[] {
	return typeof binding.keys === 'string' ? [binding.keys] : [...binding.keys];
}

/**
 * Index a table and report its conflicts. Two bindings conflict when they claim the same key
 * (compared canonically, so `esc` and `escape` are one key) and at least one of them is always
 * live — two bindings that both carry `when` are taken to be mutually exclusive.
 */
export function buildHotkeyMap<A extends string>(
	bindings: readonly HotkeyBinding<A>[]
): HotkeyMap<A> {
	const claims = new Map<string, HotkeyBinding<A>[]>();
	for (const binding of bindings) {
		for (const key of new Set(bindingKeys(binding).map(normalizeKey))) {
			const list = claims.get(key);
			if (list) list.push(binding);
			else claims.set(key, [binding]);
		}
	}
	const conflicts: HotkeyConflict<A>[] = [];
	for (const [key, list] of claims) {
		if (list.length > 1 && list.some((b) => !b.when)) {
			conflicts.push({ key, actions: list.map((b) => b.action) });
		}
	}
	return { bindings, conflicts };
}

export interface ResolveOptions {
	/** Treat the event as typing regardless of its target. By default the target decides
	 *  (`isTypingTarget`). */
	typing?: boolean;
}

/**
 * The binding a key press means, or `null` for "not ours — let it through". Pure: it never calls
 * `preventDefault`. A press already handled (`defaultPrevented`), part of an IME composition, or
 * typed into a text field (unless the binding allows it) resolves to nothing.
 */
export function resolveHotkey<A extends string>(
	event: KeyboardEvent,
	map: HotkeyMap<A>,
	options: ResolveOptions = {}
): HotkeyBinding<A> | null {
	if (event.defaultPrevented || event.isComposing) return null;
	const typing = options.typing ?? isTypingTarget(event.target);
	for (const binding of map.bindings) {
		if (typing && !binding.allowWhileTyping) continue;
		if (!bindingKeys(binding).some((key) => matchesKey(event, key))) continue;
		if (binding.when && !binding.when()) continue;
		return binding;
	}
	return null;
}

export interface HotkeyGroup<A extends string = string> {
	/** The group name, or `''` for bindings without one. */
	group: string;
	bindings: HotkeyBinding<A>[];
}

/**
 * Bindings in legend order: groups in `order` first, then any others in table order; ungrouped
 * bindings last. Hidden bindings are left out, and so are inactive ones when `activeOnly`.
 */
export function groupBindings<A extends string>(
	bindings: readonly HotkeyBinding<A>[],
	order: readonly string[] = [],
	activeOnly = false
): HotkeyGroup<A>[] {
	const groups = new Map<string, HotkeyBinding<A>[]>();
	for (const name of order) groups.set(name, []);
	for (const binding of bindings) {
		if (binding.hidden || (activeOnly && binding.when && !binding.when())) continue;
		const name = binding.group ?? '';
		if (name === '') continue;
		const list = groups.get(name);
		if (list) list.push(binding);
		else groups.set(name, [binding]);
	}
	const loose = bindings.filter(
		(b) => !b.group && !b.hidden && !(activeOnly && b.when && !b.when())
	);
	if (loose.length) groups.set('', loose);
	return [...groups]
		.filter(([, list]) => list.length)
		.map(([group, list]) => ({ group, bindings: list }));
}

export type HotkeyHandler<A extends string = string> = (
	action: A,
	binding: HotkeyBinding<A>,
	event: KeyboardEvent
) => void | boolean;

export interface InstallOptions {
	/** Where to listen. Default `window`. A pane's own keys listen on the pane. */
	target?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
	/** Off while false, or while it returns false — a Dialog is open, the view is hidden. */
	enabled?: boolean | (() => boolean);
	/** Listen in the capture phase. Default false, so a focused control handles its own keys first. */
	capture?: boolean;
}

/**
 * Listen for a map's keys and call `handler` with the action. A handled press is
 * `preventDefault`ed unless the handler returns `false`. Returns the cleanup.
 */
export function installHotkeys<A extends string>(
	map: HotkeyMap<A>,
	handler: HotkeyHandler<A>,
	options: InstallOptions = {}
): () => void {
	const target = options.target ?? (typeof window === 'undefined' ? undefined : window);
	if (!target) return () => {};
	const capture = options.capture ?? false;
	const listener = (event: Event) => {
		const enabled = options.enabled ?? true;
		if (!(typeof enabled === 'function' ? enabled() : enabled)) return;
		const binding = resolveHotkey(event as KeyboardEvent, map);
		if (!binding) return;
		if (handler(binding.action, binding, event as KeyboardEvent) !== false) event.preventDefault();
	};
	target.addEventListener('keydown', listener, capture);
	return () => target.removeEventListener('keydown', listener, capture);
}

/**
 * The same, as an attachment on an element: its keys work while focus is inside that element.
 *
 *   <section tabindex="-1" {@attach hotkeys(paneMap, runPane, { enabled: () => !editing })}>
 */
export function hotkeys<A extends string>(
	map: HotkeyMap<A>,
	handler: HotkeyHandler<A>,
	options: Omit<InstallOptions, 'target'> = {}
): Attachment<EventTarget> {
	return (target) => installHotkeys(map, handler, { ...options, target });
}

/** What a focus shortcut looks for: the first form field in its container. */
const FIELD = 'input, select, textarea, [contenteditable="true"]';

/**
 * A key that focuses the first field inside an element — `/` to search, the TopBar's and the
 * shell header's behavior. It listens on the window and stands aside while the user is typing,
 * when something earlier already handled the press (`defaultPrevented`), and when the element
 * holds no field right now; a press it takes is `preventDefault`ed. `null` turns it off.
 *
 *   <div class="search" {@attach focusShortcut('/')}>{@render search()}</div>
 */
export function focusShortcut(key: string | null = '/'): Attachment<HTMLElement> {
	return (el) => {
		if (!key || typeof window === 'undefined') return;
		const listener = (event: KeyboardEvent) => {
			if (event.defaultPrevented || isTypingTarget(event.target)) return;
			if (!matchesKey(event, key)) return;
			const field = el.querySelector<HTMLElement>(FIELD);
			if (!field) return;
			event.preventDefault();
			field.focus();
		};
		window.addEventListener('keydown', listener);
		return () => window.removeEventListener('keydown', listener);
	};
}
