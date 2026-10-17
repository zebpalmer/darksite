<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { Button, Chip, PageHeader } from '#lib';
</script>

{#snippet actions({ compact }: { compact: boolean })}
	{#if compact}
		<Button variant="icon" icon={Plus} label="New record" />
	{:else}
		<Button variant="primary" icon={Plus}>New record</Button>
	{/if}
{/snippet}

<!-- A phone-width header: a long title and two chips, with and without actions. -->
<div style="width: 375px" data-testid="phone">
	<PageHeader title="Records awaiting a second review" count={38} {actions}>
		<Chip>Field team</Chip>
		<Chip>On hold</Chip>
	</PageHeader>
</div>
<div style="width: 375px" data-testid="phone-bare">
	<PageHeader title="Records awaiting a second review" count={38}>
		<Chip>Field team</Chip>
		<Chip>On hold</Chip>
	</PageHeader>
</div>
<div style="width: 375px" data-testid="phone-long">
	<PageHeader title="Records awaiting a second review by the field team this quarter">
		<Chip>Field team</Chip>
		<Chip>On hold</Chip>
	</PageHeader>
</div>
<div style="width: 1000px" data-testid="wide">
	<PageHeader title="Records awaiting a second review" count={38} {actions}>
		<Chip>Field team</Chip>
		<Chip>On hold</Chip>
	</PageHeader>
</div>
