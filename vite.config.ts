import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			// The gallery's demo row links point at #ids that do not exist.
			prerender: { handleMissingId: 'ignore' }
		}),
		svelteTesting()
	],
	test: {
		include: ['src/**/*.test.ts'],
		// Load the stylesheets, so tokens.test.ts can read them as text through `?raw`.
		css: { include: [/src\/lib\/(tokens|base)\.css/] },
		environment: 'jsdom'
	}
});
