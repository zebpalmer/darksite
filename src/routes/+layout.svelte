<script lang="ts">
	import '#lib/tokens.css';
	import '#lib/base.css';
	import type { Snippet } from 'svelte';
	import { Button } from '#lib';

	let { children }: { children: Snippet } = $props();
	let theme = $state<'dark' | 'light'>('dark');

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
	}
</script>

<div class="gallery">
	<header>
		<a href="/" class="brand">darksite</a>
		<Button variant="ghost" size="dense" onclick={toggleTheme} pressed={theme === 'light'}>
			{theme === 'dark' ? 'Light theme' : 'Dark theme'}
		</Button>
	</header>
	<main>{@render children()}</main>
</div>

<style>
	.gallery {
		min-height: 100dvh;
		background: var(--ds-bg-1);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--ds-header-h);
		padding: 0 var(--ds-space-6) 0 var(--ds-space-5);
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	.brand {
		color: var(--ds-text-1);
		font-size: var(--ds-text-lg);
		font-weight: 500;
		text-decoration: none;
	}
	main {
		padding: var(--ds-space-5) var(--ds-space-6);
	}
</style>
