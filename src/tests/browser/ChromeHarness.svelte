<script lang="ts">
	import { AppShell, Banner, Button, PageHeader, TopBar, type NavItem } from '#lib';
	let { nav = 'top' }: { nav?: 'rail' | 'top' } = $props();
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'help', label: 'Help', href: '/help' }
	];
</script>

<AppShell {items} current="home" {nav} product="Product" toaster={false}>
	{#snippet banner()}
		<Banner id="staging" tone="warning" strong message="This is the staging site.">
			{#snippet action()}<Button size="dense">Go to the live site</Button>{/snippet}
		</Banner>
	{/snippet}
	{#snippet topBar()}<TopBar sticky label="Section" />{/snippet}
	<PageHeader title="Home" />
	<article class="ds-prose">
		<h2>A heading</h2>
		<p>Body text.</p>
	</article>
</AppShell>
