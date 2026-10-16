<!--
@component
Notice — an in-page notice: something the reader of this page should know, inside the content
("Figures for the current month are provisional", "This record was merged into R-00412"). The
shell-level condition above the TopBar is a Banner; a field's problem is a Field error.

- `tone`: `info` (default) · `success` · `warning` · `danger`, each its tint ground and its icon
  (`icon` replaces it). An optional `title` (14/500), a body (`message` or children) and at most
  one `action` (a link or a Button). The action moves under the body when the notice is narrower
  than 480px.
- `id` + `dismissible`: a dismissed notice stays dismissed for this viewer, with Banner's
  dismissal logic (`viewer` scopes it to a signed-in user; `remember={false}` dismisses for this
  page view only; `dismissed`, bindable, takes what the server already knows). A `danger` notice
  is never dismissible.
- `role="status"` for info, success and warning; `role="alert"` for danger.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import X from '@lucide/svelte/icons/x';
	import Button from './Button.svelte';
	import { dismissalKey, rememberDismissal, wasDismissed } from '../dismissal.js';
	import type { IconComponent } from '../types.js';

	interface Props {
		tone?: 'info' | 'success' | 'warning' | 'danger';
		title?: string;
		message?: string;
		icon?: IconComponent;
		/** Names the notice for a remembered dismissal. Required with `dismissible`. */
		id?: string;
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
		tone = 'info',
		title,
		message,
		icon,
		id,
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
	const storageKey = $derived(id ? dismissalKey('notice', id, viewer) : null);

	onMount(() => {
		if (canDismiss && remember && storageKey && !dismissed) dismissed = wasDismissed(storageKey);
	});

	function dismiss() {
		dismissed = true;
		ondismiss?.();
		if (remember && storageKey) rememberDismissal(storageKey);
	}

	const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: OctagonAlert };
	const Icon = $derived(icon ?? icons[tone]);
</script>

{#if !dismissed}
	<div class="ds-notice {className}" data-tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
		<div class="inner">
			<span class="icon"><Icon size={16} aria-hidden="true" /></span>
			<div class="body">
				{#if title}<p class="title">{title}</p>{/if}
				{#if children}<div class="msg">{@render children()}</div>{:else if message}<p class="msg">
						{message}
					</p>{/if}
			</div>
			{#if action}<span class="action">{@render action()}</span>{/if}
			{#if canDismiss}
				<span class="close">
					<Button variant="icon" size="dense" label={strings.dismiss} icon={X} onclick={dismiss} />
				</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ds-notice {
		container-type: inline-size;
		min-width: 0;
		border-radius: var(--ds-radius-md);
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.inner {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		grid-template-areas: 'icon body action close';
		align-items: start;
		column-gap: 10px;
		row-gap: 8px;
		padding: 10px 10px 10px 14px;
	}
	.ds-notice[data-tone='info'] {
		background: var(--ds-accent-tint);
	}
	.ds-notice[data-tone='info'] .icon {
		color: var(--ds-accent-text);
	}
	.ds-notice[data-tone='success'] {
		background: var(--ds-success-tint);
	}
	.ds-notice[data-tone='success'] .icon {
		color: var(--ds-success-text);
	}
	.ds-notice[data-tone='warning'] {
		background: var(--ds-warning-tint);
	}
	.ds-notice[data-tone='warning'] .icon {
		color: var(--ds-warning-text);
	}
	.ds-notice[data-tone='danger'] {
		background: var(--ds-danger-tint);
	}
	.ds-notice[data-tone='danger'] .icon {
		color: var(--ds-danger-text);
	}
	.icon {
		grid-area: icon;
		display: inline-flex;
		/* Centers the 16px icon on the first 20px line. */
		padding-top: 2px;
	}
	.body {
		grid-area: body;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		/* Keeps the text on the 28px row the action and close buttons sit on. */
		padding-block: 0;
		overflow-wrap: anywhere;
	}
	.title,
	.msg {
		max-width: none;
		margin: 0;
		color: inherit;
		font-size: inherit;
		line-height: inherit;
	}
	.title {
		font-weight: 500;
	}
	.msg :global(p) {
		margin: 0;
	}
	.msg :global(p + p) {
		margin-top: 6px;
	}
	.action {
		grid-area: action;
		display: inline-flex;
		align-items: center;
		flex: none;
	}
	.action :global(a) {
		color: var(--ds-text-1);
		font-weight: 500;
	}
	.close {
		grid-area: close;
		display: inline-flex;
		margin-block: -4px;
	}
	@container (max-width: 479.98px) {
		.inner {
			grid-template-columns: auto minmax(0, 1fr) auto;
			grid-template-areas:
				'icon body close'
				'. action .';
		}
		.action {
			justify-self: start;
		}
	}
</style>
