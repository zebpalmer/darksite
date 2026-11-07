<!--
@component
ConnectionStatus — the quiet state of the app's link to its server, for the top bar's actions or the
rail's `status` slot: offline, reconnecting, sending queued changes, changes waiting, or changes the
server refused. It renders nothing while everything is connected and sent.

The worst state shows: refused changes, then offline, then reconnecting, then syncing, then
waiting. Refused changes are a button opening a panel that lists each one with its reason, a
Dismiss for each and an optional Retry; every other state is a status line, not a control.
Reconnecting fades in after 400ms, so one quick retry never flickers. Changes are announced in a
polite live region.

- `online` (omit it to follow the browser's own `navigator.onLine`), `reconnecting`, `syncing`,
  `queued` (a count), `failed` (`{ id, label, reason? }[]`), `onretry`, `ondismiss(id)`, `compact`
  (icon only, its words in the tooltip and to screen readers: a collapsed rail), `tip` (the rail
  slot's `tip`, for that tooltip), `class`.
- It reads only the text roles, so it takes the colors of whatever bar or rail it sits in; the icon
  and the words carry the state.
-->
<script lang="ts" module>
	/** A change the server refused, shown in the ConnectionStatus panel. */
	export interface ConnectionFailure {
		id: string;
		label: string;
		reason?: string;
	}
</script>

<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import X from '@lucide/svelte/icons/x';
	import { strings } from '../strings.svelte.js';
	import Button from './Button.svelte';
	import Popover from './Popover.svelte';
	import Spinner from './Spinner.svelte';
	import type { TipHandlers } from './NavRail.svelte';

	interface Props {
		online?: boolean;
		reconnecting?: boolean;
		syncing?: boolean;
		queued?: number;
		failed?: ConnectionFailure[];
		onretry?: () => void;
		ondismiss?: (id: string) => void;
		compact?: boolean;
		tip?: (label: string) => TipHandlers;
		class?: string;
	}

	let {
		online,
		reconnecting = false,
		syncing = false,
		queued = 0,
		failed = [],
		onretry,
		ondismiss,
		compact = false,
		tip,
		class: className = ''
	}: Props = $props();

	// The browser's own view, used while the app passes no `online` of its own.
	let browserOnline = $state(true);
	$effect(() => {
		if (online !== undefined || typeof navigator === 'undefined') return;
		const update = () => (browserOnline = navigator.onLine);
		update();
		window.addEventListener('online', update);
		window.addEventListener('offline', update);
		return () => {
			window.removeEventListener('online', update);
			window.removeEventListener('offline', update);
		};
	});
	const isOnline = $derived(online ?? browserOnline);

	type Shown = 'failed' | 'offline' | 'reconnecting' | 'syncing' | 'waiting' | null;
	const shown: Shown = $derived(
		failed.length
			? 'failed'
			: !isOnline
				? 'offline'
				: reconnecting
					? 'reconnecting'
					: syncing
						? 'syncing'
						: queued > 0
							? 'waiting'
							: null
	);

	const spoken = $derived.by(() => {
		const parts: string[] = [];
		if (failed.length) parts.push(strings.notSavedCount(failed.length));
		if (!isOnline) parts.push(strings.offline);
		else if (reconnecting) parts.push(strings.reconnecting);
		else if (syncing) parts.push(strings.syncing);
		if (queued > 0) parts.push(strings.changesWaiting(queued));
		return parts.join(', ');
	});

	// The visible words for a status line: the tooltip of a compact one.
	const words = $derived(
		shown === 'offline'
			? [strings.offline, queued > 0 ? strings.waiting(queued) : ''].filter(Boolean).join(' · ')
			: shown === 'reconnecting'
				? strings.reconnecting
				: shown === 'syncing'
					? [strings.syncing, queued > 0 ? queued.toLocaleString() : ''].filter(Boolean).join(' · ')
					: shown === 'waiting'
						? strings.waiting(queued)
						: strings.notSavedCount(failed.length)
	);

	let open = $state(false);
</script>

<div class="ds-connection {className}" data-compact={compact ? '' : undefined}>
	<span class="ds-sr-only" role="status" aria-live="polite">{spoken}</span>
	{#if shown === 'failed'}
		<Popover bind:open title={strings.notSaved} width="300px">
			{#snippet trigger(attrs)}
				{#if compact}
					<Button
						{...attrs}
						{...tip?.(words)}
						variant="icon"
						size="dense"
						icon={CircleAlert}
						label={words}
						class="ds-connection-failed"
					/>
				{:else}
					<Button {...attrs} variant="ghost" size="dense" icon={CircleAlert} class="ds-connection-failed">
						{words}
					</Button>
				{/if}
			{/snippet}
			{#if !isOnline || queued > 0}
				<p class="note">
					{[!isOnline ? strings.offline : '', queued > 0 ? strings.waiting(queued) : '']
						.filter(Boolean)
						.join(' · ')}
				</p>
			{/if}
			<ul class="list">
				{#each failed as f (f.id)}
					<li>
						<span class="what">
							<span class="label">{f.label}</span>
							{#if f.reason}<span class="reason">{f.reason}</span>{/if}
						</span>
						{#if ondismiss}
							<Button
								variant="icon"
								size="dense"
								icon={X}
								label="{strings.dismiss} {f.label}"
								onclick={() => ondismiss(f.id)}
							/>
						{/if}
					</li>
				{/each}
			</ul>
			{#if onretry}
				<div class="foot"><Button size="dense" onclick={onretry}>{strings.retry}</Button></div>
			{/if}
		</Popover>
	{:else if shown}
		<span class="line" data-state={shown} aria-hidden="true" {...compact ? tip?.(words) : {}}>
			{#if shown === 'offline'}
				<WifiOff size={16} />{#if !compact}{strings.offline}{#if queued > 0}<span class="count"
							>· {strings.waiting(queued)}</span
						>{/if}{/if}
			{:else if shown === 'reconnecting'}
				<Spinner />{#if !compact}{strings.reconnecting}{/if}
			{:else if shown === 'syncing'}
				<Spinner />{#if !compact}{strings.syncing}{#if queued > 0}<span class="count"
							>· {queued.toLocaleString()}</span
						>{/if}{/if}
			{:else}
				<CloudUpload size={16} />{#if !compact}{strings.waiting(queued)}{/if}
			{/if}
		</span>
	{/if}
</div>

<style>
	.ds-connection {
		display: inline-flex;
		align-items: center;
		min-width: 0;
	}
	.line {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: var(--ds-h-default);
		padding: 0 8px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		white-space: nowrap;
	}
	.line :global(svg) {
		flex-shrink: 0;
	}
	[data-compact] .line {
		justify-content: center;
		width: var(--ds-h-default);
		padding: 0;
	}
	.line[data-state='reconnecting'] {
		animation: ds-fade var(--ds-dur-base) var(--ds-ease-out) 400ms both;
	}
	.count {
		color: var(--ds-text-3);
		font-variant-numeric: tabular-nums;
	}
	.ds-connection :global(.ds-connection-failed) {
		color: var(--ds-text-1);
	}
	.note {
		margin: 0 0 8px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list li {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
		padding: 6px 0;
		border-top: 1px solid var(--ds-border-subtle);
	}
	.list li:first-child {
		border-top: 0;
	}
	.what {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.label {
		color: var(--ds-text-1);
		overflow-wrap: anywhere;
	}
	.reason {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.foot {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}
</style>
