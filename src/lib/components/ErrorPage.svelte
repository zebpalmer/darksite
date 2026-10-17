<script lang="ts" module>
	export interface ErrorCopy {
		title: string;
		message: string;
	}

	/** Neutral default copy by status. Says what happened and what to do; never blames the viewer,
	 *  never jokes, never shows a stack trace. */
	export function errorCopy(status: number | null | undefined): ErrorCopy {
		switch (status) {
			case 0:
				return {
					title: 'Offline',
					message: "Can't reach the server. Check your connection, then try again."
				};
			case 400:
				return { title: 'Request not understood', message: 'Check the address, then try again.' };
			case 401:
				return { title: 'Signed out', message: 'Sign in again to continue.' };
			case 403:
				return { title: 'No access', message: "You don't have access to this page." };
			case 404:
				return {
					title: 'Page not found',
					message: "This page doesn't exist, or you don't have access to it."
				};
			case 408:
			case 504:
				return { title: 'Took too long', message: 'The server took too long to answer. Try again.' };
			case 429:
				return { title: 'Too many requests', message: 'Wait a moment, then try again.' };
			case 503:
				return { title: 'Unavailable', message: 'The service is unavailable right now. Try again soon.' };
			default:
				return {
					title: 'Something went wrong',
					message: "The page couldn't load. Try again, and if it keeps happening, report it."
				};
		}
	}
</script>

<!--
@component
ErrorPage — the focused page for a failed route: the status code in mono, a title, one sentence
and at most two actions (Try again, Go home). One centered column, vertically centered when short
(docs/layout.md, "Focused page"). Built for `+error.svelte`.

- `status` (`0` for offline; the code shows above the title when it is an HTTP status), `title`
  and `message` (default to neutral copy for the status — `errorCopy`), `onretry` (shows
  "Try again"), `homeHref` (shows "Go home"; `homeLabel` renames it), `actions` snippet (replaces
  both), `detail` (a reference for support, such as a request id, in mono `ds-text-3`), `icon`,
  `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import FileQuestionMark from '@lucide/svelte/icons/file-question-mark';
	import House from '@lucide/svelte/icons/house';
	import Lock from '@lucide/svelte/icons/lock';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';

	import Button from './Button.svelte';
	import type { IconComponent } from '../types.js';

	interface Props {
		status?: number | null;
		title?: string;
		message?: string;
		onretry?: () => void;
		homeHref?: string;
		homeLabel?: string;
		actions?: Snippet;
		detail?: string;
		icon?: IconComponent;
		class?: string;
	}

	let {
		status = null,
		title,
		message,
		onretry,
		homeHref,
		homeLabel = strings.goHome,
		actions,
		detail,
		icon,
		class: className = ''
	}: Props = $props();

	const copy = $derived(errorCopy(status));
	const Icon = $derived(
		icon ??
			(status === 0
				? CloudOff
				: status === 404
					? FileQuestionMark
					: status === 401 || status === 403
						? Lock
						: CircleAlert)
	);
	const uid = $props.id();
</script>

<section class="ds-errorpage {className}" aria-labelledby="{uid}-title">
	<div class="col">
		<span class="icon"><Icon size={24} aria-hidden="true" /></span>
		{#if status}<p class="status">{status}</p>{/if}
		<h1 class="title" id="{uid}-title">{title ?? copy.title}</h1>
		<p class="msg">{message ?? copy.message}</p>
		{#if actions || onretry || homeHref}
			<div class="actions">
				{#if actions}
					{@render actions()}
				{:else}
					{#if homeHref}<Button href={homeHref} icon={House}>{homeLabel}</Button>{/if}
					{#if onretry}<Button variant="primary" icon={RefreshCw} onclick={onretry}
							>{strings.tryAgain}</Button
						>{/if}
				{/if}
			</div>
		{/if}
		{#if detail}<p class="detail">{detail}</p>{/if}
	</div>
</section>

<style>
	.ds-errorpage {
		display: grid;
		place-items: center;
		min-height: min(100%, 70dvh);
		padding: 48px 16px;
	}
	.col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		max-width: 440px;
		text-align: center;
	}
	.icon {
		display: inline-flex;
		color: var(--ds-text-3);
	}
	.status {
		margin: 0;
		color: var(--ds-text-3);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.title {
		margin: 0;
		color: var(--ds-text-heading);
		font-size: var(--ds-text-xl);
		font-weight: 500;
		line-height: var(--ds-lh-xl);
	}
	.msg {
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 8px;
	}
	.detail {
		margin: 8px 0 0;
		color: var(--ds-text-3);
		font-family: var(--font-mono);
		font-size: var(--ds-text-xs);
		overflow-wrap: anywhere;
	}
</style>
