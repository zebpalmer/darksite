<script lang="ts">
	import { PageHeader } from '#lib';
</script>

<svelte:head><title>AppShell · darksite</title></svelte:head>
<PageHeader title="AppShell" />
<div class="prose">
	<p>
		This gallery is an AppShell. The rail on the left is its NavRail; below 768px it gives way to a
		TabBar whose More sheet holds the rest of the list and the theme switcher. The column you are
		reading is padded; PageHeader above cancels that padding to sit flush.
	</p>
	<p>
		Tab once from the address bar: the first stop is "Skip to content". Toasts from any page land in
		the shell's one Toaster, above the tab bar and any ActionBar.
	</p>
</div>

<style>
	.prose {
		max-width: 640px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
</style>
