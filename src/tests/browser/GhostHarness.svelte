<script lang="ts">
	import { AppShell, type NavItem } from '#lib';
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'posts', label: 'Posts', href: '/posts' }
	];
	// Flat synthetic images of known sizes: the gallery's row height comes from the tallest.
	const img = (w: number, h: number) =>
		`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="gray"/></svg>`)}`;
</script>

<!-- The markup is Ghost's (Koenig's) card output, as a post's HTML arrives. -->
<AppShell {items} current="posts" nav="top" product="Product" toaster={false}>
	<article class="ds-article ds-article-ghost">
		<header>
			<h1>A title for the article</h1>
		</header>
		<p data-testid="para">
			A paragraph of body text, long enough to fill the text column from one edge to the other at
			the article's measure, so its width is the column's width.
		</p>
		<figure class="kg-card kg-image-card" data-testid="regular">
			<img src={img(1600, 900)} class="kg-image" alt="" width="1600" height="900" />
		</figure>
		<figure class="kg-card kg-image-card kg-width-wide kg-card-hascaption" data-testid="wide">
			<img src={img(1600, 600)} class="kg-image" alt="" width="1600" height="600" />
			<figcaption>A caption under a wide image.</figcaption>
		</figure>
		<figure class="kg-card kg-image-card kg-width-full kg-card-hascaption" data-testid="full">
			<img src={img(2000, 600)} class="kg-image" alt="" width="2000" height="600" />
			<figcaption>A caption under a full-width image.</figcaption>
		</figure>
		<figure class="kg-card kg-gallery-card kg-width-wide" data-testid="gallery">
			<div class="kg-gallery-container">
				<div class="kg-gallery-row">
					<div class="kg-gallery-image">
						<img src={img(300, 200)} width="300" height="200" alt="" />
					</div>
					<div class="kg-gallery-image">
						<img src={img(200, 300)} width="200" height="300" alt="" />
					</div>
					<div class="kg-gallery-image">
						<img src={img(300, 300)} width="300" height="300" alt="" />
					</div>
				</div>
			</div>
		</figure>
		<figure class="kg-card kg-bookmark-card" data-testid="bookmark">
			<a class="kg-bookmark-container" href="/posts/1">
				<div class="kg-bookmark-content">
					<div class="kg-bookmark-title">A linked page</div>
					<div class="kg-bookmark-description">A sentence from the linked page.</div>
					<div class="kg-bookmark-metadata">
						<img class="kg-bookmark-icon" src={img(32, 32)} alt="" />
						<span class="kg-bookmark-author">A publication</span>
						<span class="kg-bookmark-publisher">A. Rivera</span>
					</div>
				</div>
				<div class="kg-bookmark-thumbnail"><img src={img(480, 240)} alt="" /></div>
			</a>
		</figure>
		<div class="kg-card kg-callout-card kg-callout-card-blue" data-testid="callout">
			<div class="kg-callout-emoji">!</div>
			<div class="kg-callout-text">A callout with a short note.</div>
		</div>
		<figure class="kg-card kg-embed-card" data-testid="embed">
			<iframe width="200" height="113" title="An embedded player" srcdoc="<p>Player</p>"></iframe>
		</figure>
	</article>
</AppShell>
