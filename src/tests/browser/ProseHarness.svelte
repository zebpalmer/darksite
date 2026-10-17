<script lang="ts">
	import { AppShell, PageHeader, type NavItem } from '#lib';
	let { nav, proseAlign }: { nav: 'rail' | 'top'; proseAlign?: 'start' | 'center' } = $props();
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'help', label: 'Help', href: '/help' }
	];
</script>

<AppShell {items} current="help" {nav} {proseAlign} product="Product" toaster={false}>
	<PageHeader title="How it works" />
	<article class="ds-prose">
		<p>A paragraph of text at a readable measure, long enough to fill the measure of the column.</p>
	</article>
</AppShell>
