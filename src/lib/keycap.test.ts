import { describe, expect, it } from 'vitest';
import { formatKey, formatKeys, isTypingTarget } from './keycap.js';

describe('formatKey', () => {
	it('renders modifiers as symbols and named keys as words', () => {
		expect(formatKey('shift+enter')).toBe('⇧Enter');
		expect(formatKey('ctrl+k')).toBe('⌃k');
		expect(formatKey('space')).toBe('Space');
		expect(formatKey('escape')).toBe('Esc');
		expect(formatKey('down')).toBe('↓');
	});

	it('leaves single characters as they are', () => {
		expect(formatKey('g')).toBe('g');
		expect(formatKey('/')).toBe('/');
	});

	it('reads a lone + as the plus key', () => {
		expect(formatKey('+')).toBe('+');
		expect(formatKey('plus')).toBe('+');
		expect(formatKey('shift++')).toBe('⇧+');
		expect(formatKey('ctrl+plus')).toBe('⌃+');
	});

	it('is case-insensitive and trims', () => {
		expect(formatKey(' Shift+Enter ')).toBe('⇧Enter');
	});
});

describe('formatKeys', () => {
	it('joins alternatives', () => {
		expect(formatKeys(['j', 'down'])).toBe('j / ↓');
		expect(formatKeys('space', ' or ')).toBe('Space');
	});
});

describe('isTypingTarget', () => {
	it('counts text entry, not checkboxes, radios or buttons', () => {
		const el = (html: string) => {
			const host = document.createElement('div');
			host.innerHTML = html;
			return host.firstElementChild;
		};
		expect(isTypingTarget(el('<input type="text">'))).toBe(true);
		expect(isTypingTarget(el('<input>'))).toBe(true);
		expect(isTypingTarget(el('<input type="search">'))).toBe(true);
		expect(isTypingTarget(el('<textarea></textarea>'))).toBe(true);
		expect(isTypingTarget(el('<input type="checkbox">'))).toBe(false);
		expect(isTypingTarget(el('<input type="radio">'))).toBe(false);
		expect(isTypingTarget(el('<input type="range">'))).toBe(false);
		expect(isTypingTarget(el('<button>Go</button>'))).toBe(false);
	});
});
