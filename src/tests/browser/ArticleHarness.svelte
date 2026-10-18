<script lang="ts">
	import { AppShell, CodeBlock, type NavItem } from '#lib';
	let {
		nav = 'top',
		contentWidth,
		style
	}: { nav?: 'rail' | 'top'; contentWidth?: boolean | number | string; style?: string } = $props();
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'posts', label: 'Posts', href: '/posts' }
	];
</script>

<AppShell {items} current="posts" {nav} {contentWidth} product="Product" toaster={false}>
	<article class="ds-article" {style}>
		<header>
			<p class="ds-article-kicker">Field notes</p>
			<h1>A title for the article</h1>
			<p class="ds-article-summary">A sentence that says what the article is about.</p>
			<p class="ds-article-meta">
				<span>By A. Rivera</span>
				<time datetime="2026-10-04">October 4, 2026</time>
				<span>Updated October 14, 2026</span>
				<span>Long-form writing</span>
				<span>6 min read</span>
			</p>
		</header>
		<p data-testid="para">
			A paragraph of body text, long enough to fill the text column from one edge to the other at
			the article's measure, so its width is the column's width.
		</p>
		<figure class="ds-article-wide" data-testid="wide">
			<div style="height: 120px; background: var(--ds-bg-3)"></div>
			<figcaption>A caption under a wide figure.</figcaption>
		</figure>
		<h2>A section heading</h2>
		<p data-testid="before-code">Another paragraph after the heading.</p>
		<CodeBlock code="tool run --all" label="Shell" class="article-code" />
		<p>A paragraph after the code.</p>
	</article>
</AppShell>
