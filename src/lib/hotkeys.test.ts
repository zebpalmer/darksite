import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import {
	buildHotkeyMap,
	groupBindings,
	installHotkeys,
	resolveHotkey,
	type HotkeyBinding
} from './hotkeys.js';
import { matchesKey, normalizeKey } from './keycap.js';
import ShortcutHarness from '../tests/ShortcutHarness.svelte';

type Action = 'next' | 'prev' | 'edit' | 'archive' | 'legend' | 'leave' | 'search';

const ev = (key: string, init: KeyboardEventInit = {}) =>
	new KeyboardEvent('keydown', { key, cancelable: true, ...init });

let selected = false;
const table: HotkeyBinding<Action>[] = [
	{ keys: ['j', 'down'], action: 'next', label: 'Next record', group: 'Move' },
	{ keys: ['k', 'up'], action: 'prev', label: 'Previous record', group: 'Move' },
	{ keys: 'e', action: 'edit', label: 'Edit', group: 'Record', when: () => selected },
	{ keys: 'shift+e', action: 'archive', label: 'Archive', group: 'Record' },
	{ keys: '?', action: 'legend', label: 'Show shortcuts', group: 'Help' },
	{ keys: 'escape', action: 'leave', label: 'Leave the field', allowWhileTyping: true },
	{ keys: 'ctrl+k', action: 'search', label: 'Search', hidden: true }
];

describe('normalizeKey', () => {
	it('gives every spelling of a key one canonical form', () => {
		expect(normalizeKey('Cmd+Shift+K')).toBe('meta+shift+k');
		expect(normalizeKey('shift+control+k')).toBe('ctrl+shift+k');
		expect(normalizeKey('esc')).toBe('escape');
		expect(normalizeKey('ArrowUp')).toBe('up');
	});
});

describe('matchesKey and letters', () => {
	it('treats g and shift+g as different keys, and ignores CapsLock', () => {
		expect(matchesKey(ev('G', { shiftKey: true }), 'g')).toBe(false);
		expect(matchesKey(ev('G', { shiftKey: true }), 'shift+g')).toBe(true);
		expect(matchesKey(ev('G'), 'g')).toBe(true);
	});
});

describe('buildHotkeyMap', () => {
	it('has no conflicts in a clean table', () => {
		expect(buildHotkeyMap(table).conflicts).toEqual([]);
	});

	it('reports a key claimed twice, comparing spellings canonically', () => {
		const map = buildHotkeyMap<Action>([
			{ keys: 'esc', action: 'leave', label: 'Leave' },
			{ keys: ['x', 'escape'], action: 'archive', label: 'Archive' }
		]);
		expect(map.conflicts).toEqual([{ key: 'escape', actions: ['leave', 'archive'] }]);
	});

	it('lets two conditional bindings share a key', () => {
		const map = buildHotkeyMap<Action>([
			{ keys: 'e', action: 'edit', label: 'Edit', when: () => true },
			{ keys: 'e', action: 'archive', label: 'Archive', when: () => false }
		]);
		expect(map.conflicts).toEqual([]);
	});
});

describe('resolveHotkey', () => {
	const map = buildHotkeyMap(table);

	it('resolves alternatives, shifted letters and folded characters', () => {
		expect(resolveHotkey(ev('j'), map)?.action).toBe('next');
		expect(resolveHotkey(ev('ArrowDown'), map)?.action).toBe('next');
		expect(resolveHotkey(ev('E', { shiftKey: true }), map)?.action).toBe('archive');
		expect(resolveHotkey(ev('?', { shiftKey: true }), map)?.action).toBe('legend');
		expect(resolveHotkey(ev('k', { ctrlKey: true }), map)?.action).toBe('search');
		expect(resolveHotkey(ev('j', { metaKey: true }), map)).toBeNull();
		expect(resolveHotkey(ev('q'), map)).toBeNull();
	});

	it('honors when', () => {
		selected = false;
		expect(resolveHotkey(ev('e'), map)).toBeNull();
		selected = true;
		expect(resolveHotkey(ev('e'), map)?.action).toBe('edit');
	});

	it('stands aside while typing, except for bindings that allow it', () => {
		const input = document.createElement('input');
		document.body.append(input);
		const typed = (key: string) => {
			const e = ev(key, { bubbles: true });
			input.dispatchEvent(e);
			return e;
		};
		expect(resolveHotkey(typed('j'), map)).toBeNull();
		expect(resolveHotkey(typed('Escape'), map)?.action).toBe('leave');
		expect(resolveHotkey(ev('j'), map, { typing: true })).toBeNull();
		input.remove();
	});

	it('ignores a press something else already handled', () => {
		const e = ev('j');
		e.preventDefault();
		expect(resolveHotkey(e, map)).toBeNull();
	});
});

describe('groupBindings', () => {
	it('orders groups, skips hidden bindings and puts ungrouped ones last', () => {
		const groups = groupBindings(table, ['Help']);
		expect(groups.map((g) => g.group)).toEqual(['Help', 'Move', 'Record', '']);
		expect(groups.flatMap((g) => g.bindings).some((b) => b.action === 'search')).toBe(false);
	});

	it('can leave out bindings that are not live', () => {
		selected = false;
		const record = groupBindings(table, [], true).find((g) => g.group === 'Record');
		expect(record?.bindings.map((b) => b.action)).toEqual(['archive']);
	});
});

describe('installHotkeys', () => {
	const map = buildHotkeyMap(table);
	let cleanup = () => {};
	afterEach(() => cleanup());

	it('calls the handler, prevents the default and stops after cleanup', () => {
		const run = vi.fn();
		cleanup = installHotkeys(map, run);
		const e = ev('j');
		window.dispatchEvent(e);
		expect(run).toHaveBeenCalledWith('next', table[0], e);
		expect(e.defaultPrevented).toBe(true);
		cleanup();
		window.dispatchEvent(ev('j'));
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('lets the handler decline, and can be switched off', () => {
		let on = true;
		const run = vi.fn(() => false);
		cleanup = installHotkeys(map, run, { enabled: () => on });
		const e = ev('k');
		window.dispatchEvent(e);
		expect(e.defaultPrevented).toBe(false);
		on = false;
		window.dispatchEvent(ev('k'));
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('listens on an element when given one', () => {
		const pane = document.createElement('section');
		document.body.append(pane);
		const run = vi.fn();
		cleanup = installHotkeys(map, run, { target: pane });
		window.dispatchEvent(ev('j'));
		expect(run).not.toHaveBeenCalled();
		pane.dispatchEvent(ev('j'));
		expect(run).toHaveBeenCalledTimes(1);
		pane.remove();
	});
});

describe('focusShortcut', () => {
	const press = (key: string, target: EventTarget = window) => {
		const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });
		target.dispatchEvent(event);
		return event;
	};

	it('focuses the first field in its element and takes the key', () => {
		render(ShortcutHarness);
		const event = press('/');
		expect(event.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Find' }));
	});

	it('stands aside while typing and when the press was already handled', () => {
		render(ShortcutHarness);
		const elsewhere = screen.getByRole('textbox', { name: 'Elsewhere' });
		elsewhere.focus();
		expect(press('/', elsewhere).defaultPrevented).toBe(false);
		expect(document.activeElement).toBe(elsewhere);
		elsewhere.blur();
		const handled = new KeyboardEvent('keydown', { key: '/', cancelable: true });
		handled.preventDefault();
		window.dispatchEvent(handled);
		expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Find' }));
	});

	it('leaves the key alone with no field, with null, and after unmount', () => {
		const { unmount } = render(ShortcutHarness, { field: false });
		expect(press('/').defaultPrevented).toBe(false);
		unmount();
		const off = render(ShortcutHarness, { shortcut: null });
		expect(press('/').defaultPrevented).toBe(false);
		off.unmount();
		expect(press('/').defaultPrevented).toBe(false);
	});

	it('takes any key token', () => {
		render(ShortcutHarness, { shortcut: 'ctrl+k' });
		expect(press('/').defaultPrevented).toBe(false);
		const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
		window.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Find' }));
	});
});
