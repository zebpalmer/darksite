import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { MediaFlag, PHONE_QUERY } from './media.svelte.js';
import MediaHarness from '../tests/MediaHarness.svelte';

type Listener = () => void;

function fakeMatchMedia(initial: boolean) {
	const listeners = new Set<Listener>();
	const list = {
		matches: initial,
		media: PHONE_QUERY,
		addEventListener: (_: string, fn: Listener) => listeners.add(fn),
		removeEventListener: (_: string, fn: Listener) => listeners.delete(fn)
	};
	const set = (value: boolean) => {
		list.matches = value;
		for (const fn of listeners) fn();
	};
	return { matchMedia: vi.fn(() => list as unknown as MediaQueryList), set, listeners };
}

describe('MediaFlag', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('reads false where matchMedia is missing', () => {
		vi.stubGlobal('matchMedia', undefined);
		expect(new MediaFlag(PHONE_QUERY).current).toBe(false);
		expect(new MediaFlag(PHONE_QUERY, true).current).toBe(true);
	});

	it('reads the query and follows changes', () => {
		const fake = fakeMatchMedia(true);
		vi.stubGlobal('matchMedia', fake.matchMedia);
		const flag = new MediaFlag(PHONE_QUERY);
		expect(flag.current).toBe(true);
		fake.set(false);
		expect(flag.current).toBe(false);
		expect(fake.matchMedia).toHaveBeenCalledWith(PHONE_QUERY);
	});

	it('updates markup that reads it, and lets go on unmount', async () => {
		const fake = fakeMatchMedia(false);
		vi.stubGlobal('matchMedia', fake.matchMedia);
		const flag = new MediaFlag(PHONE_QUERY);
		const { unmount } = render(MediaHarness, { flag });
		expect(screen.getByText('wide')).toBeTruthy();
		expect(fake.listeners.size).toBe(1);
		fake.set(true);
		await vi.waitFor(() => expect(screen.getByText('phone')).toBeTruthy());
		unmount();
		await vi.waitFor(() => expect(fake.listeners.size).toBe(0));
	});
});
