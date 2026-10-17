// The viewer's mode: dark, light, the reading modes (paper, night), high contrast, or system (follow
// the device). One store for the app; `ModePicker` is its control.
//
//   mode.init();                       // once, in the root layout: read the saved choice and apply it
//   mode.init({ fallback: 'dark' });   // the mode used while nothing is saved (default: system)
//   mode.set('paper');                 // apply, save in this browser, tell subscribers
//   mode.subscribe((m) => saveToAccount(m));   // keep it per account too
//
// It sets `data-ds-theme` on <html> (which wins over `data-theme`, so it never fights another
// library's attribute) and removes it for `system`. To avoid a flash of the wrong mode on load, put
// `modeScript()` (or `modeScript('dark')`, matching `init`'s fallback) in a <script> in app.html's
// <head>: it applies the saved mode, or the fallback, before first paint. `MODE_SCRIPT` is
// `modeScript()`.
import { strings } from './strings.svelte.js';

export type Mode = 'system' | 'dark' | 'light' | 'paper' | 'night' | 'contrast';

export const MODES: readonly Mode[] = ['system', 'dark', 'light', 'paper', 'night', 'contrast'];

/** The word for a mode, from `strings`. */
export function modeLabel(m: Mode): string {
	return {
		system: strings.modeSystem,
		dark: strings.modeDark,
		light: strings.modeLight,
		paper: strings.modePaper,
		night: strings.modeNight,
		contrast: strings.modeContrast
	}[m];
}

const DEFAULT_KEY = 'darksite:mode';
const isMode = (x: unknown): x is Mode => MODES.includes(x as Mode);

/**
 * The inline script for app.html's <head>: applies the saved mode — or `fallback` while nothing is
 * saved — before the page paints. Pass the same `fallback` (and `storageKey`) as `mode.init`.
 */
export function modeScript(fallback: Mode = 'system', storageKey: string = DEFAULT_KEY): string {
	const modes = JSON.stringify(MODES);
	return (
		`try{var m=null;try{m=localStorage.getItem(${JSON.stringify(storageKey)})}catch(e){}` +
		`if(${modes}.indexOf(m)<0)m=${JSON.stringify(fallback)};` +
		`if(m!=='system')document.documentElement.setAttribute('data-ds-theme',m)}catch(e){}`
	);
}

/** `modeScript()`: applies the saved mode before the page paints, and follows the device while
 *  nothing is saved. */
export const MODE_SCRIPT = modeScript();

/** Whether a mode draws light text on a dark ground. `system` is neither: resolve it first. */
export function isDarkMode(m: Exclude<Mode, 'system'>): boolean {
	return m === 'dark' || m === 'night' || m === 'contrast';
}

export class ModeStore {
	current = $state<Mode>('system');
	#key = DEFAULT_KEY;
	#listeners = new Set<(m: Mode) => void>();

	/** Read the saved choice (or `initial`, say from the viewer's account) and apply it. With
	 *  neither, `fallback` applies (default `system`, which follows the device). */
	init(options: { storageKey?: string; initial?: Mode; fallback?: Mode } = {}) {
		if (options.storageKey) this.#key = options.storageKey;
		let saved: string | null = null;
		try {
			saved = localStorage.getItem(this.#key);
		} catch {
			/* storage unavailable */
		}
		this.#apply(options.initial ?? (isMode(saved) ? saved : (options.fallback ?? 'system')));
	}

	/** Choose a mode: applied at once, saved in this browser, passed to subscribers. */
	set(m: Mode, { persist = true }: { persist?: boolean } = {}) {
		this.#apply(m);
		if (persist) {
			try {
				localStorage.setItem(this.#key, m);
			} catch {
				/* storage unavailable: this page view only */
			}
		}
		for (const fn of this.#listeners) fn(m);
	}

	/** Called on every choice the viewer makes, e.g. to save it with their account. */
	subscribe(fn: (m: Mode) => void): () => void {
		this.#listeners.add(fn);
		return () => this.#listeners.delete(fn);
	}

	#apply(m: Mode) {
		this.current = m;
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		if (m === 'system') root.removeAttribute('data-ds-theme');
		else root.setAttribute('data-ds-theme', m);
	}
}

/** The app's mode. */
export const mode = new ModeStore();
