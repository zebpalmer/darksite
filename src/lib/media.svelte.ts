// Reactive media checks, the same ones the components use. SSR-safe: on the server, and wherever
// `matchMedia` is missing, each reads as false. Read them in markup, `$derived` or `$effect` and
// they update when the viewport or input changes.

import { createSubscriber } from 'svelte/reactivity';

/** The phone layout: below `ds-bp-phone` (768px). */
export const PHONE_QUERY = '(max-width: 767.98px)';
/** A coarse pointer — touch. Controls grow to 44px. */
export const COARSE_QUERY = '(pointer: coarse)';

/** One media query as a reactive boolean: `new MediaFlag(query).current`. */
export class MediaFlag {
	readonly query: string;
	readonly #fallback: boolean;
	#list: MediaQueryList | null = null;
	readonly #subscribe: () => void;

	constructor(query: string, fallback = false) {
		this.query = query;
		this.#fallback = fallback;
		this.#subscribe = createSubscriber((update) => {
			const list = this.#mql();
			if (!list) return;
			list.addEventListener?.('change', update);
			return () => list.removeEventListener?.('change', update);
		});
	}

	#mql(): MediaQueryList | null {
		if (!this.#list && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
			this.#list = window.matchMedia(this.query);
		}
		return this.#list;
	}

	get current(): boolean {
		this.#subscribe();
		return this.#mql()?.matches ?? this.#fallback;
	}
}

const phone = new MediaFlag(PHONE_QUERY);
const coarse = new MediaFlag(COARSE_QUERY);

/** `media.phone` — the phone layout; `media.coarse` — a touch pointer. Reactive, SSR-safe. */
export const media = {
	get phone(): boolean {
		return phone.current;
	},
	get coarse(): boolean {
		return coarse.current;
	}
};
