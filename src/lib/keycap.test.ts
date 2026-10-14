import { describe, expect, it } from 'vitest';
import { formatKey, formatKeys } from './keycap.js';

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
