import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { playwright } from '@vitest/browser-playwright';
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
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/*.browser.test.ts', 'src/**/*.ssr.test.ts'],
					// Load the stylesheets, so tokens.test.ts can read them as text through `?raw`.
					css: { include: [/src\/lib\/(tokens|base)\.css/] },
					environment: 'jsdom'
				}
			},
			{
				// Top layer, modality, focus and layout, in a real browser (Chromium via Playwright).
				extends: true,
				resolve: { conditions: ['browser'] },
				test: {
					name: 'browser',
					include: ['src/**/*.browser.test.ts'],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						viewport: { width: 1280, height: 800 },
						instances: [{ browser: 'chromium' }]
					}
				}
			},
			{
				// Server rendering: components compiled for the server, run in Node. It does not extend
				// the root config, whose testing-library plugin is for the browser builds.
				extends: false,
				plugins: [svelte()],
				test: {
					name: 'ssr',
					include: ['src/**/*.ssr.test.ts'],
					environment: 'node'
				}
			}
		]
	}
});
