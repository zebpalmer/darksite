<script lang="ts">
	import { thumb } from '../../thumbs.js';
</script>

<svelte:head><title>Ghost content · darksite</title></svelte:head>
<!-- A post's HTML as Ghost's editor (Koenig) writes it, opted in with `ds-article-ghost`. A real
     page renders it with {@html post.html} in the same place, after the header. -->
<article class="ds-article ds-article-ghost">
	<header>
		<p class="ds-article-kicker ds-article-kicker-caps">Sample</p>
		<h1>Ghost content in an article</h1>
		<p class="ds-article-summary">
			The card markup the Ghost editor writes, mapped onto the article's columns and rhythm.
		</p>
		<p class="ds-article-meta">
			<span>By A. Rivera</span>
			<time datetime="2026-10-04">October 4, 2026</time>
			<span>3 min read</span>
		</p>
	</header>

	<p>
		Paragraphs, headings, lists and quotes need nothing from the mapping: Ghost writes them as bare
		elements, and the article styles those already. The cards are what it adds.
	</p>

	<figure class="kg-card kg-image-card kg-card-hascaption">
		<img
			src={thumb(3, 720, 405)}
			class="kg-image"
			alt="A gradient placeholder"
			width="720"
			height="405"
		/>
		<figcaption>An image card at the regular width, the text column.</figcaption>
	</figure>

	<figure class="kg-card kg-image-card kg-width-wide kg-card-hascaption">
		<img
			src={thumb(5, 1120, 440)}
			class="kg-image"
			alt="A gradient placeholder"
			width="1120"
			height="440"
		/>
		<figcaption><code>kg-width-wide</code> takes the wide column.</figcaption>
	</figure>

	<figure class="kg-card kg-image-card kg-width-full kg-card-hascaption">
		<img
			src={thumb(9, 1600, 400)}
			class="kg-image"
			alt="A gradient placeholder"
			width="1600"
			height="400"
		/>
		<figcaption>
			<code>kg-width-full</code> takes the whole page column; its caption stays on the text column.
		</figcaption>
	</figure>

	<h2>Galleries, bookmarks and callouts</h2>
	<p>A gallery is always wide: rows of images, each row as tall as its tallest image.</p>

	<figure class="kg-card kg-gallery-card kg-width-wide kg-card-hascaption">
		<div class="kg-gallery-container">
			<div class="kg-gallery-row">
				<div class="kg-gallery-image">
					<img src={thumb(11, 480, 320)} width="480" height="320" alt="A gradient placeholder" />
				</div>
				<div class="kg-gallery-image">
					<img src={thumb(12, 480, 320)} width="480" height="320" alt="A gradient placeholder" />
				</div>
				<div class="kg-gallery-image">
					<img src={thumb(13, 480, 320)} width="480" height="320" alt="A gradient placeholder" />
				</div>
			</div>
			<div class="kg-gallery-row">
				<div class="kg-gallery-image">
					<img src={thumb(14, 640, 360)} width="640" height="360" alt="A gradient placeholder" />
				</div>
				<div class="kg-gallery-image">
					<img src={thumb(15, 640, 360)} width="640" height="360" alt="A gradient placeholder" />
				</div>
			</div>
		</div>
		<figcaption>A gallery of five images in two rows.</figcaption>
	</figure>

	<figure class="kg-card kg-bookmark-card">
		<a class="kg-bookmark-container" href="/article">
			<div class="kg-bookmark-content">
				<div class="kg-bookmark-title">Writing release notes people read</div>
				<div class="kg-bookmark-description">
					Most release notes are a list of commits with the hashes taken off. A few habits turn them
					into something a reader can act on in a minute.
				</div>
				<div class="kg-bookmark-metadata">
					<img class="kg-bookmark-icon" src={thumb(2, 40, 40)} alt="" />
					<span class="kg-bookmark-author">The gallery</span>
					<span class="kg-bookmark-publisher">A. Rivera</span>
				</div>
			</div>
			<div class="kg-bookmark-thumbnail">
				<img src={thumb(7, 480, 240)} alt="" />
			</div>
		</a>
	</figure>

	<div class="kg-card kg-callout-card kg-callout-card-blue">
		<div class="kg-callout-emoji">→</div>
		<div class="kg-callout-text">
			A callout is a tinted box. Green, yellow and red take the success, warning and danger tints.
		</div>
	</div>

	<div class="kg-card kg-callout-card kg-callout-card-grey">
		<div class="kg-callout-text">A gray callout sits on the raised ground instead.</div>
	</div>

	<figure class="kg-card kg-embed-card kg-card-hascaption">
		<iframe
			width="200"
			height="113"
			title="A placeholder player"
			srcdoc="<p style='font-family: sans-serif'>A third-party player, in its own document.</p>"
		></iframe>
		<figcaption>An embed fills the text column at 16:9.</figcaption>
	</figure>

	<p>The cards keep the article's rhythm: more space around them than between paragraphs.</p>
</article>
