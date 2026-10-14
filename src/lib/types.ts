import type { Component } from 'svelte';

/** Control heights: dense 28 · default 32 · comfy 36 · touch 44. */
export type ControlSize = 'dense' | 'default' | 'comfy' | 'touch';

/** A Lucide icon component (or anything with the same props). */
export type IconComponent = Component<{
	size?: number | string;
	class?: string;
	'aria-hidden'?: boolean | 'true' | 'false';
}>;
