<!--
@component
EmptyState — "nothing here" with a way forward: a solid ds-border edge (never dashed — dashed means not
confirmed), a 24px icon, a 16/500 title, one sentence and one action.

- `title`, `message` (one sentence), `icon` (Lucide; an inbox by default), `action` snippet (a
  single Button), `align` (`start` default | `center` for a lone full-page state).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Inbox from '@lucide/svelte/icons/inbox';
	import type { IconComponent } from '../types.js';

	interface Props {
		title: string;
		message?: string;
		icon?: IconComponent;
		action?: Snippet;
		align?: 'start' | 'center';
		class?: string;
	}

	let { title, message, icon: Icon = Inbox, action, align = 'start', class: className = '' }: Props =
		$props();
</script>

<div class="ds-empty {className}" data-align={align}>
	<span class="icon"><Icon size={24} aria-hidden="true" /></span>
	<p class="title">{title}</p>
	{#if message}<p class="msg">{message}</p>{/if}
	{#if action}<div class="action">{@render action()}</div>{/if}
</div>

<style>
	.ds-empty {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 28px 20px;
		border: 1px solid var(--ds-border);
		border-radius: var(--ds-radius-md);
	}
	.ds-empty[data-align='center'] {
		align-items: center;
		text-align: center;
	}
	.icon {
		display: inline-flex;
		color: var(--ds-text-3);
	}
	.title {
		margin: 0;
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		font-weight: 500;
		color: var(--ds-text-1);
	}
	.msg {
		margin: 0;
		max-width: 60ch;
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		color: var(--ds-text-2);
	}
	.action {
		margin-top: 4px;
	}
</style>
