<!--
@component
EntityCard — an organization or a person as a row: a 56px Avatar, the name, one meta line. ds-bg-2
with a ds-border-subtle edge; hover is ds-bg-4. Put it in a `Grid min={280}`, which makes a row
grid: one per line on a narrow pane.

- `href`, `name`, `image`, `shape` (`square` for an organization, `round` for a person), `meta`,
  `code` (a short mono tag beside the name), `trailing` snippet (outside the link), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import Avatar from './Avatar.svelte';

	interface Props {
		href: string;
		name: string;
		image?: string | null;
		shape?: 'round' | 'square';
		meta?: string;
		code?: string;
		trailing?: Snippet;
		class?: string;
	}

	let { href, name, image, shape = 'round', meta, code, trailing, class: className = '' }: Props =
		$props();
</script>

<div class="ds-entity {className}">
	<a {href} class="main">
		<Avatar {name} src={image} {shape} size={56} />
		<span class="text">
			<span class="top">
				<span class="name" title={name}>{name}</span>
				{#if code}<span class="code">{code}</span>{/if}
			</span>
			{#if meta}<span class="meta" title={meta}>{meta}</span>{/if}
		</span>
	</a>
	{#if trailing}<div class="trail">{@render trailing()}</div>{/if}
</div>

<style>
	.ds-entity {
		display: flex;
		align-items: center;
		min-width: 0;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		transition: background var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-entity:hover {
		background: var(--ds-bg-4);
	}
	.main {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 12px;
		min-width: 0;
		padding: 10px 12px;
		border-radius: inherit;
		color: inherit;
		text-decoration: none;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.top {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}
	.name,
	.meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.name {
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		font-weight: 500;
	}
	.code {
		flex: none;
		color: var(--ds-text-3);
		font-family: var(--font-mono);
		font-size: var(--ds-text-xs);
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	.trail {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-right: 12px;
	}
</style>
