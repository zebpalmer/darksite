// Hotkey tokens → display text. The token grammar is lowercase, "+"-joined:
// `shift+enter`, `space`, `g`, `ctrl+k`. Modifiers render as symbols, named keys as words.

const MODIFIERS: Record<string, string> = {
	shift: '⇧',
	ctrl: '⌃',
	control: '⌃',
	alt: '⌥',
	option: '⌥',
	meta: '⌘',
	cmd: '⌘'
};

const NAMED: Record<string, string> = {
	enter: 'Enter',
	return: 'Enter',
	space: 'Space',
	escape: 'Esc',
	esc: 'Esc',
	tab: 'Tab',
	backspace: '⌫',
	delete: 'Del',
	home: 'Home',
	end: 'End',
	pageup: 'PgUp',
	pagedown: 'PgDn',
	up: '↑',
	down: '↓',
	left: '←',
	right: '→',
	arrowup: '↑',
	arrowdown: '↓',
	arrowleft: '←',
	arrowright: '→'
};

/** `shift+enter` → `⇧Enter`, `space` → `Space`, `g` → `g`. */
export function formatKey(token: string): string {
	const parts = token.trim().toLowerCase().split('+');
	const key = parts.pop() ?? '';
	const mods = parts.map((m) => MODIFIERS[m] ?? m).join('');
	const named = NAMED[key] ?? (key.length <= 1 ? key : key[0].toUpperCase() + key.slice(1));
	return mods + named;
}

/** One token, or several alternatives joined by `separator`. */
export function formatKeys(keys: string | readonly string[], separator = ' / '): string {
	return (typeof keys === 'string' ? [keys] : [...keys]).map(formatKey).join(separator);
}

const EVENT_KEYS: Record<string, string> = {
	enter: 'Enter',
	return: 'Enter',
	space: ' ',
	escape: 'Escape',
	esc: 'Escape',
	tab: 'Tab',
	backspace: 'Backspace',
	delete: 'Delete',
	home: 'Home',
	end: 'End',
	pageup: 'PageUp',
	pagedown: 'PageDown',
	up: 'ArrowUp',
	down: 'ArrowDown',
	left: 'ArrowLeft',
	right: 'ArrowRight',
	arrowup: 'ArrowUp',
	arrowdown: 'ArrowDown',
	arrowleft: 'ArrowLeft',
	arrowright: 'ArrowRight'
};

/** Whether a keyboard event is the hotkey a token names (`shift+enter`, `z`, `ctrl+k`). */
export function matchesKey(event: KeyboardEvent, token: string): boolean {
	const parts = token.trim().toLowerCase().split('+');
	const key = parts.pop() ?? '';
	const mods = new Set(
		parts.map((m) => (m === 'control' ? 'ctrl' : m === 'option' ? 'alt' : m === 'cmd' ? 'meta' : m))
	);
	if (
		event.ctrlKey !== mods.has('ctrl') ||
		event.altKey !== mods.has('alt') ||
		event.metaKey !== mods.has('meta')
	)
		return false;
	const named = EVENT_KEYS[key];
	if (named) return event.key === named && event.shiftKey === mods.has('shift');
	// A single character: shift may be part of the character itself (`?` is shift+/).
	if (mods.has('shift') && !event.shiftKey) return false;
	// A letter wears shift as a prefix, so `g` and `shift+g` are two different keys. Matching on
	// the lowercased character also keeps CapsLock from turning one command into another.
	if (/^[a-z]$/.test(key) && event.shiftKey && !mods.has('shift')) return false;
	return event.key.toLowerCase() === key;
}

const MOD_ORDER = ['ctrl', 'alt', 'meta', 'shift'] as const;
const MOD_ALIASES: Record<string, string> = { control: 'ctrl', option: 'alt', cmd: 'meta' };
const KEY_ALIASES: Record<string, string> = {
	return: 'enter',
	esc: 'escape',
	arrowup: 'up',
	arrowdown: 'down',
	arrowleft: 'left',
	arrowright: 'right',
	' ': 'space'
};

/**
 * One canonical spelling of a token, so two bindings can be compared: modifiers resolved to
 * `ctrl` / `alt` / `meta` / `shift` in that order, key aliases folded (`esc` → `escape`,
 * `arrowup` → `up`). `Cmd+Shift+K` → `meta+shift+k`.
 */
export function normalizeKey(token: string): string {
	const parts = token.trim().toLowerCase().split('+');
	const raw = parts.pop() ?? '';
	const key = KEY_ALIASES[raw] ?? raw;
	const mods = new Set(parts.map((m) => MOD_ALIASES[m] ?? m));
	return [...MOD_ORDER.filter((m) => mods.has(m)), key].join('+');
}

const NOT_TYPING = new Set([
	'checkbox',
	'radio',
	'button',
	'submit',
	'reset',
	'range',
	'file',
	'color',
	'image'
]);

/** Page hotkeys stand aside while the user is typing. A focused checkbox, radio or button is not
 *  typing, so hotkeys keep working after Tab lands on a row's checkbox. */
export function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target instanceof HTMLInputElement) return !NOT_TYPING.has(target.type);
	return (
		target.isContentEditable ||
		['TEXTAREA', 'SELECT'].includes(target.tagName) ||
		target.closest('[contenteditable="true"]') !== null
	);
}
