<script lang="ts">
	import { KeyCap } from '#lib';
</script>

<svelte:head><title>KeyCap · darksite</title></svelte:head>

<h1>KeyCap</h1>
<div class="row">
	<KeyCap keys="g" />
	<KeyCap keys="space" />
	<KeyCap keys="shift+enter" />
	<KeyCap keys="escape" />
	<KeyCap keys={['j', 'down']} />
</div>
<dl>
	<dt><KeyCap keys="space" hint={false} /></dt>
	<dd>Play</dd>
	<dt><KeyCap keys="shift+enter" hint={false} /></dt>
	<dd>Create and apply</dd>
</dl>
<p>
	Hint caps hide on phones and when hints are off; legend caps (<code>hint=&#123;false&#125;</code>)
	always show.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		gap: var(--ds-space-3);
		margin-bottom: var(--ds-space-6);
	}
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ds-space-1-5) var(--ds-space-3);
		align-items: center;
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	dd {
		margin: 0;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
