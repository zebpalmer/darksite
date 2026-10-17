<script lang="ts">
	import { AppShell, FactList, PageHeader, Stat, StatRow, type NavItem } from '#lib';
	let { contentWidth, wide = false }: { contentWidth?: boolean | number | string; wide?: boolean } =
		$props();
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'nodes', label: 'Nodes', href: '/nodes' }
	];
</script>

<AppShell {items} current="home" nav="top" product="Product" {contentWidth} toaster={false}>
	{#snippet footer()}<div style="padding: 14px 24px" data-testid="foot">Footer</div>{/snippet}
	<PageHeader title="Home" />
	<div data-testid="content" class={wide ? 'ds-wide' : undefined}>
		<div style="width: 900px" data-testid="three">
			<StatRow max={3}>
				<Stat label="Nodes" value={412} variant="headline" />
				<Stat label="Links" value={1284} variant="headline" />
				<Stat label="Sites" value={36} variant="headline" />
			</StatRow>
		</div>
		<div style="display: flex; align-items: center; gap: 12px; width: 600px" data-testid="row">
			<FactList
				layout="inline"
				items={[
					{ label: 'Firmware', value: 'Version 2.7.1' },
					{ label: 'Owner', value: 'Field team' }
				]}
			/>
			<button type="button">Edit</button>
		</div>
	</div>
</AppShell>
