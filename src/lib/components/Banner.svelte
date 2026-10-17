<!--
@component
Banner — a system-level condition the user must know about but that belongs to no field: "The
nightly sync has failed for 3 hours", "Read-only maintenance from 18:00". Full width above the
TopBar, inside the shell, pushing content down — never overlaying it.

- `tone`: `info` · `warning` · `danger`, each with its icon. One sentence (`message` or children)
  and at most one `action` (a link or a Button).
- `strong`: the tone's solid fill instead of its tint, for a condition that must not be missed
  (a staging site, an outage). Everything inside takes the fill's contrast color, and a Button in
  `action` is outlined.
- `id` + `dismissible`: a dismissed banner stays dismissed for this viewer (`viewer` scopes it to
  a signed-in user). A `danger` banner is never dismissible while its condition holds — show it
  until the condition clears.
- `remember` (default true): false dismisses for this page view only — the banner returns on the
  next load. For a notice that must come back while its condition holds, such as an update
  waiting to be loaded.
- `dismissed` (bindable): pass what the server already knows (a cookie), so a dismissed banner
  never shows before hydration.
- `role="status"` for info and warning, `role="alert"` for danger.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import X from '@lucide/svelte/icons/x';
	import Button from './Button.svelte';
	import { dismissalKey, rememberDismissal, wasDismissed } from '../dismissal.js';

	interface Props {
		id: string;
		tone?: 'info' | 'warning' | 'danger';
		/** The tone's solid fill instead of its tint. */
		strong?: boolean;
		message?: string;
		dismissible?: boolean;
		/** Dismissed already, as the server knows it (a cookie): no flash before hydration. Bindable. */
		dismissed?: boolean;
		remember?: boolean;
		viewer?: string;
		ondismiss?: () => void;
		action?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		id,
		tone = 'info',
		strong = false,
		message,
		dismissible = false,
		dismissed = $bindable(false),
		remember = true,
		viewer,
		ondismiss,
		action,
		class: className = '',
		children
	}: Props = $props();

	const canDismiss = $derived(dismissible && tone !== 'danger');
	const storageKey = $derived(dismissalKey('banner', id, viewer));

	onMount(() => {
		if (canDismiss && remember && !dismissed) dismissed = wasDismissed(storageKey);
	});

	function dismiss() {
		dismissed = true;
		ondismiss?.();
		if (remember) rememberDismissal(storageKey);
	}

	const Icon = $derived(tone === 'danger' ? OctagonAlert : tone === 'warning' ? TriangleAlert : Info);
</script>

{#if !dismissed}
	<div
		class="ds-banner {className}"
		data-tone={tone}
		data-strong={strong ? '' : undefined}
		role={tone === 'danger' ? 'alert' : 'status'}
	>
		<span class="icon"><Icon size={16} aria-hidden="true" /></span>
		<p class="msg">{#if children}{@render children()}{:else}{message}{/if}</p>
		{#if action}<span class="action">{@render action()}</span>{/if}
		{#if canDismiss}
			<Button variant="icon" size="dense" label={strings.dismiss} icon={X} onclick={dismiss} />
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
	/* Strong: the tone's solid fill. The text roles inside become its contrast color, so the
	   message, the icon, a link and the dismiss button follow; a secondary Button turns into an
	   outline of that color. */
	.ds-banner[data-strong] {
		--ds-text-1: var(--on);
		--ds-text-2: var(--on);
		--ds-text-3: var(--on);
		--ds-border: var(--on);
		--ds-border-strong: var(--on);
		--ds-focus: var(--on);
		--ds-bg-4: color-mix(in srgb, var(--on) 10%, transparent);
		--ds-bg-5: color-mix(in srgb, var(--on) 18%, transparent);
		border-bottom-color: transparent;
		background: var(--fill);
		color: var(--on);
	}
	.ds-banner[data-strong] .icon {
		color: var(--on);
	}
	.ds-banner[data-strong][data-tone='info'] {
		--fill: var(--ds-accent);
		--on: var(--ds-accent-contrast);
	}
	.ds-banner[data-strong][data-tone='warning'] {
		--fill: var(--ds-warning-fill);
		--on: var(--ds-warning-contrast);
	}
	.ds-banner[data-strong][data-tone='danger'] {
		--fill: var(--ds-danger-fill);
		--on: var(--ds-danger-contrast);
	}
	.ds-banner[data-strong] .action :global(.ds-btn[data-variant='secondary']) {
		background: transparent;
	}
	.ds-banner[data-strong] .action :global(.ds-btn[data-variant='secondary']:hover) {
		background: var(--ds-bg-4);
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
