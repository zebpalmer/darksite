<!--
@component
Avatar — a person's or an organization's picture, falling back to initials on ds-bg-4 with a
ds-border edge, also when the image fails to load. Shape carries meaning: `round` for people and
accounts, `square` for organizations (whose initials switch to mono).

- `name` (initials and alt text), `src`, `size` (px, default 32; the font steps up at 48),
  `shape`, `class`.
-->
<script lang="ts">
	import { initials } from '../labels.js';

	interface Props {
		name: string;
		src?: string | null;
		size?: number;
		shape?: 'round' | 'square';
		class?: string;
	}

	let { name, src, size = 32, shape = 'round', class: className = '' }: Props = $props();

	let failed = $state<string | null>(null);
	const showImage = $derived(!!src && failed !== src);
	const letters = $derived(initials(name));
</script>

<span
	class="ds-avatar {className}"
	data-shape={shape}
	data-large={size >= 48 ? '' : undefined}
	style:width="{size}px"
	style:height="{size}px"
>
	{#if showImage}
		<img {src} alt={name} loading="lazy" onerror={() => (failed = src ?? null)} />
	{:else}
		<span class="initials" role="img" aria-label={name}>{letters}</span>
	{/if}
</span>

<style>
	.ds-avatar {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border: 1px solid var(--ds-border);
		border-radius: 50%;
		background: var(--ds-bg-4);
		color: var(--ds-text-2);
		font-size: var(--ds-text-xs);
		font-weight: 500;
		line-height: 1;
	}
	[data-shape='square'] {
		border-radius: var(--ds-radius-sm);
		color: var(--ds-text-1);
		font-family: var(--font-mono);
	}
	[data-large] {
		font-size: var(--ds-text-md);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
