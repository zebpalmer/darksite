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
