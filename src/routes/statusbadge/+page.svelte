<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import { StatusBadge } from '#lib';
	const twelveDaysAgo = new Date(Date.now() - 12 * 86_400_000);
	const day = (offset: number) => new Date(Date.now() + offset * 86_400_000);
</script>

<svelte:head><title>StatusBadge · darksite</title></svelte:head>
<h1>StatusBadge</h1>
<div class="row">
	<StatusBadge label="Draft" />
	<StatusBadge label="Primary" tone="accent" icon={Star} />
	<StatusBadge label="Scheduled" tone="info" />
	<StatusBadge label="Ready" tone="success" />
	<StatusBadge label="On hold" tone="warning" since={twelveDaysAgo} />
	<StatusBadge label="Failed" tone="danger" />
	<StatusBadge label="Retired" tone="muted" />
</div>
<div class="row">
	<StatusBadge label="Review" until={day(3)} />
	<StatusBadge label="Review" until={day(0)} />
	<StatusBadge label="Review" until={day(-2)} />
</div>
<p>Static and non-interactive: a clickable state is a Chip, an ordered scale is a SeverityBadge.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
