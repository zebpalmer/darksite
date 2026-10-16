<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface Step {
		title: string;
		text?: string;
		/** A link to where the step is done. */
		href?: string;
		linkLabel?: string;
	}
</script>

<!--
@component
Steps — numbered steps for getting something done: "Get started", a setup, a how-to's outline. An
ordered list (screen readers hear the count and position), each step a number, a title, a sentence
and an optional link. Three or four across when there is room, by the list's own width; one per line
below that.

- `steps` (`{ title, text?, href?, linkLabel? }[]`), `step` snippet (custom content for a step;
  receives `{ step, index }`), `label` (names the list), `class`.
-->
<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	interface Props {
		steps: readonly Step[];
		step?: Snippet<[{ step: Step; index: number }]>;
		label?: string;
		class?: string;
	}

	let { steps, step, label, class: className = '' }: Props = $props();
</script>

<div class="ds-steps {className}">
	<ol aria-label={label}>
		{#each steps as s, i (i)}
			<li class="step">
				<span class="n" aria-hidden="true">{i + 1}</span>
				<div class="body">
					{#if step}{@render step({ step: s, index: i })}{:else}
						<p class="title">{s.title}</p>
						{#if s.text}<p class="text">{s.text}</p>{/if}
						{#if s.href}<a class="go" href={s.href}
								>{s.linkLabel ?? s.title}<ArrowRight size={14} aria-hidden="true" /></a
							>{/if}
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</div>

<style>
	.ds-steps {
		container-type: inline-size;
	}
	ol {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@container (min-width: 720px) {
		ol {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
	}
	.step {
		display: flex;
		gap: 12px;
		padding: 14px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
	}
	.n {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 28px;
		height: 28px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent-tint);
		color: var(--ds-accent-text);
		font-size: var(--ds-text-sm);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.title {
		margin: 0;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		font-weight: 500;
		line-height: 28px;
	}
	.text {
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
		color: var(--ds-accent-text);
		font-size: var(--ds-text-sm);
		text-decoration: none;
	}
	.go:hover {
		text-decoration: underline;
	}
</style>
