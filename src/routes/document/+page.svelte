<script lang="ts">
	import { PageHeader } from '#lib';
</script>

<svelte:head><title>Document page · darksite</title></svelte:head>
<PageHeader title="How a finding becomes a task" />
<article class="ds-prose">
	<p>
		An inspection is a checklist run at one site. Every item that fails becomes a finding, and every
		finding becomes a task for the field team, due by its severity.
	</p>
	<h2>What counts as a finding</h2>
	<p>
		An item fails when the inspector marks it so, or when a measurement falls outside its range.
		Items marked "does not apply" are left out and noted on the record.
	</p>
	<ul>
		<li>Critical and high findings are due within a week.</li>
		<li>Medium and low findings join the next scheduled visit.</li>
	</ul>
	<h2>Reading the report</h2>
	<p>
		The pass rate is the share of applicable items that passed. Run <code
			>report --site R-00412</code
		>
		to get the same numbers in a terminal.
	</p>
</article>
