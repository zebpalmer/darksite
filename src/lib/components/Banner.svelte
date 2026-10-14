<!--
@component
Banner — a system-level condition the user must know about but that belongs to no field: "The
nightly sync has failed for 3 hours", "Read-only maintenance from 18:00". Full width above the
TopBar, inside the shell, pushing content down — never overlaying it.

- `tone`: `info` · `warning` · `danger`, each with its icon. One sentence (`message` or children)
  and at most one `action` (a link or a Button).
- `id` + `dismissible`: a dismissed banner stays dismissed for this viewer (`viewer` scopes it to
  a signed-in user). A `danger` banner is never dismissible while its condition holds — show it
  until the condition clears.
- `role="status"` for info and warning, `role="alert"` for danger.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import X from '@lucide/svelte/icons/x';
	import Button from './Button.svelte';

	interface Props {
		id: string;
		tone?: 'info' | 'warning' | 'danger';
		message?: string;
		dismissible?: boolean;
		viewer?: string;
		ondismiss?: () => void;
		action?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		id,
		tone = 'info',
		message,
		dismissible = false,
		viewer,
		ondismiss,
		action,
		class: className = '',
		children
	}: Props = $props();

	const canDismiss = $derived(dismissible && tone !== 'danger');
	const storageKey = $derived(`darksite:banner:${viewer ? `${viewer}:` : ''}${id}`);
	let dismissed = $state(false);

	onMount(() => {
		if (!canDismiss) return;
		try {
			dismissed = localStorage.getItem(storageKey) === '1';
		} catch {
			/* storage unavailable: show it */
		}
	});

	function dismiss() {
		dismissed = true;
		try {
			localStorage.setItem(storageKey, '1');
		} catch {
			/* storage unavailable: dismissed for this page view only */
		}
		ondismiss?.();
	}

	const Icon = $derived(tone === 'danger' ? OctagonAlert : tone === 'warning' ? TriangleAlert : Info);
</script>

{#if !dismissed}
	<div class="ds-banner {className}" data-tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
		<span class="icon"><Icon size={16} aria-hidden="true" /></span>
		<p class="msg">{#if children}{@render children()}{:else}{message}{/if}</p>
		{#if action}<span class="action">{@render action()}</span>{/if}
		{#if canDismiss}
			<Button variant="icon" size="dense" label="Dismiss" icon={X} onclick={dismiss} />
		{/if}
	</div>
{/if}

<style>
	.ds-banner {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 40px;
		padding: 4px 8px 4px 16px;
		border-bottom: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-1);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.ds-banner[data-tone='info'] {
		background: var(--ds-accent-tint);
	}
	.ds-banner[data-tone='info'] .icon {
		color: var(--ds-accent-text);
	}
	.ds-banner[data-tone='warning'] {
		background: var(--ds-warning-tint);
	}
	.ds-banner[data-tone='warning'] .icon {
		color: var(--ds-warning-text);
	}
	.ds-banner[data-tone='danger'] {
		background: var(--ds-danger-tint);
	}
	.ds-banner[data-tone='danger'] .icon {
		color: var(--ds-danger-text);
	}
	.icon {
		display: inline-flex;
		flex: none;
	}
	.msg {
		flex: 1;
		min-width: 0;
		margin: 0;
	}
	.action {
		display: inline-flex;
		flex: none;
	}
	.action :global(a) {
		color: var(--ds-text-1);
		font-weight: 500;
	}
</style>
