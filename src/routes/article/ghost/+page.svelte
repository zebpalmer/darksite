<script lang="ts">
	import { ghostCards, SegmentedControl } from '#lib';
	import { thumb } from '../../thumbs.js';

	// The other cards, as a string: a real page puts Ghost's HTML in with {@html post.html}, and so
	// does this, so the attachment sees what a site's article sees.
	const star =
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
	const stars = (n: number) =>
		[1, 2, 3, 4, 5]
			.map(
				(i) =>
					`<span class="${i <= n ? 'kg-product-card-rating-active' : ''} kg-product-card-rating-star">${star}</span>`
			)
			.join('');
	const chevron =
		'<svg id="Regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path class="cls-1" d="M23.25,7.311,12.53,18.03a.749.749,0,0,1-1.06,0L.75,7.311"></path></svg>';
	const toggle = (heading: string, content: string) => `
<div class="kg-card kg-toggle-card" data-kg-toggle-state="close">
	<div class="kg-toggle-heading">
		<h4 class="kg-toggle-heading-text">${heading}</h4>
		<button class="kg-toggle-card-icon" aria-label="Expand toggle to read content">${chevron}</button>
	</div>
	<div class="kg-toggle-content"><p>${content}</p></div>
</div>`;

	const cards = `
<h2>Headers and buttons</h2>
<p>A header card is a band: a heading, a subheading and a button. The first version is always full width, in four styles and three sizes.</p>
<div class="kg-card kg-header-card kg-width-full kg-size-large kg-style-image" data-kg-background-image="" style="background-image: url(&quot;${thumb(21, 1600, 640)}&quot;)">
	<h2 class="kg-header-card-header" id="a-header-over-an-image">A header over an image</h2>
	<h3 class="kg-header-card-subheader" id="the-scrim-keeps-the-text-readable">The scrim keeps the text readable on any picture</h3>
	<a class="kg-header-card-button" href="#a-header-over-an-image">Read on</a>
</div>
<div class="kg-card kg-header-card kg-width-full kg-size-small kg-style-dark" data-kg-background-image="" style="">
	<h2 class="kg-header-card-header" id="a-small-dark-header">A small dark header</h2>
	<h3 class="kg-header-card-subheader" id="on-the-deepest-ground">On the deepest ground</h3>
</div>
<div class="kg-card kg-header-card kg-width-full kg-size-medium kg-style-accent" data-kg-background-image="" style="">
	<h2 class="kg-header-card-header" id="a-medium-accent-header">A medium accent header</h2>
	<h3 class="kg-header-card-subheader" id="on-the-accent-tint">On the accent tint</h3>
</div>
<p>The second version adds widths and layouts. Its colors, which the editor writes inline, become darksite's: a dark background is the deepest ground, a light one the raised ground.</p>
<div class="kg-card kg-header-card kg-v2 kg-width-regular" style="background-color: #000000;" data-background-color="#000000">
	<div class="kg-header-card-content">
		<div class="kg-header-card-text kg-align-center">
			<h2 id="a-regular-header" class="kg-header-card-heading" style="color: #FFFFFF;" data-text-color="#FFFFFF">A regular header</h2>
			<p id="centered-in-the-text-column" class="kg-header-card-subheading" style="color: #FFFFFF;" data-text-color="#FFFFFF">Centered, in the text column</p>
			<a href="#a-regular-header" class="kg-header-card-button kg-style-accent" style="color: #FFFFFF;" data-button-color="accent" data-button-text-color="#FFFFFF">Get started</a>
		</div>
	</div>
</div>
<div class="kg-card kg-header-card kg-v2 kg-width-wide" data-background-color="#000000">
	<picture><img class="kg-header-card-image" src="${thumb(24, 1120, 480)}" loading="lazy" alt="" /></picture>
	<div class="kg-header-card-content">
		<div class="kg-header-card-text">
			<h2 id="a-wide-header-on-an-image" class="kg-header-card-heading" style="color: #FFFFFF;" data-text-color="#FFFFFF">A wide header on an image</h2>
			<p id="its-subheading" class="kg-header-card-subheading" style="color: #FFFFFF;" data-text-color="#FFFFFF">Its subheading, on the scrim</p>
		</div>
	</div>
</div>
<div class="kg-card kg-header-card kg-v2 kg-layout-split kg-width-full" style="background-color: #F0F0F0;" data-background-color="#F0F0F0">
	<div class="kg-header-card-content">
		<picture><img class="kg-header-card-image" src="${thumb(27, 800, 800)}" loading="lazy" alt="" /></picture>
		<div class="kg-header-card-text">
			<h2 id="a-split-header" class="kg-header-card-heading" style="color: #000000;" data-text-color="#000000">A split header</h2>
			<p id="the-image-beside-the-text" class="kg-header-card-subheading" style="color: #000000;" data-text-color="#000000">The image beside the text; above it in a narrow article.</p>
			<a href="#a-split-header" class="kg-header-card-button" style="background-color: #000000;color: #FFFFFF;" data-button-color="#000000" data-button-text-color="#FFFFFF">Learn more</a>
		</div>
	</div>
</div>
<p>A button card is one button, centered or on the left. Ghost's accent button is the primary button; a header's or a call to action's other buttons are secondary.</p>
<div class="kg-card kg-button-card kg-align-center"><a href="#a-header-over-an-image" class="kg-btn kg-btn-accent">Read the guide</a></div>
<div class="kg-card kg-button-card kg-align-left"><a href="#a-header-over-an-image" class="kg-btn kg-btn-accent">On the left</a></div>

<h2>Files, products and calls to action</h2>
<div class="kg-card kg-file-card">
	<a class="kg-file-card-container" href="${thumb(30, 40, 40)}" title="Download" download="">
		<div class="kg-file-card-contents">
			<div class="kg-file-card-title">Field checklist</div>
			<div class="kg-file-card-caption">A printable list for the first visit.</div>
			<div class="kg-file-card-metadata"><div class="kg-file-card-filename">field-checklist.svg</div><div class="kg-file-card-filesize">1 KB</div></div>
		</div>
		<div class="kg-file-card-icon"><svg viewBox="0 0 24 24"><defs><style>.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style></defs><title>download-circle</title><polyline class="a" points="8.25 14.25 12 18 15.75 14.25"></polyline><line class="a" x1="12" y1="6.75" x2="12" y2="18"></line><circle class="a" cx="12" cy="12" r="11.25"></circle></svg></div>
	</a>
</div>
<div class="kg-card kg-product-card">
	<div class="kg-product-card-container">
		<img src="${thumb(33, 560, 320)}" width="560" height="320" class="kg-product-card-image" loading="lazy" />
		<div class="kg-product-card-title-container"><h4 class="kg-product-card-title">A sample notebook</h4></div>
		<div class="kg-product-card-rating">${stars(4)}</div>
		<div class="kg-product-card-description"><p>Ruled pages, a stiff cover and a ribbon. A product card is at most 560px wide, centered.</p></div>
		<a href="#a-sample-notebook" class="kg-product-card-button kg-product-card-btn-accent" target="_blank" rel="noopener noreferrer"><span>Buy it</span></a>
	</div>
</div>
<div class="kg-card kg-cta-card kg-cta-bg-grey kg-cta-minimal kg-cta-has-img" data-layout="minimal">
	<div class="kg-cta-sponsor-label-wrapper"><div class="kg-cta-sponsor-label"><span style="white-space: pre-wrap;">Sponsored</span></div></div>
	<div class="kg-cta-content">
		<div class="kg-cta-image-container"><a href="#a-call"><img src="${thumb(36, 128, 128)}" alt="CTA Image"></a></div>
		<div class="kg-cta-content-inner">
			<div class="kg-cta-text"><p>A call to action in the minimal layout: the image beside the text, on a gray ground.</p></div>
			<a href="#a-call" class="kg-cta-button" style="background-color: #000000; color: #ffffff;">Learn more</a>
		</div>
	</div>
</div>
<div class="kg-card kg-cta-card kg-cta-bg-blue kg-cta-immersive kg-cta-centered kg-cta-has-img kg-cta-link-accent" data-layout="immersive">
	<div class="kg-cta-sponsor-label-wrapper"><div class="kg-cta-sponsor-label"><span style="white-space: pre-wrap;">Sponsored</span></div></div>
	<div class="kg-cta-content">
		<div class="kg-cta-image-container"><img src="${thumb(39, 720, 300)}" alt="CTA Image"></div>
		<div class="kg-cta-content-inner">
			<div class="kg-cta-text"><p>The immersive layout stacks and centers, on the accent tint, with <a href="#a-call">an accent link</a>.</p></div>
			<a href="#a-call" class="kg-cta-button kg-style-accent" style="color: #ffffff;">Learn more</a>
		</div>
	</div>
</div>
<div class="kg-card kg-cta-card kg-cta-bg-none kg-cta-minimal" data-layout="minimal">
	<div class="kg-cta-content">
		<div class="kg-cta-content-inner">
			<div class="kg-cta-text"><p>With no background, a call to action sits between dividers.</p></div>
		</div>
	</div>
</div>

<h2>Toggles, audio and video</h2>
${toggle('What does a toggle hide?', 'Its content, until the heading is opened. Without the attachment it stays open.')}
${toggle('Can the keyboard open it?', 'Yes: the heading is a button. Tab to it and press Enter or Space.')}
<div class="kg-card kg-audio-card">
	<img src="${thumb(42, 128, 128)}" alt="audio-thumbnail" class="kg-audio-thumbnail" />
	<div class="kg-audio-thumbnail placeholder kg-audio-hide"><svg width="24" height="24" fill="none"></svg></div>
	<div class="kg-audio-player-container">
		<audio preload="metadata"></audio>
		<div class="kg-audio-title">An audio card, with the browser's own controls</div>
		<div class="kg-audio-player"><button class="kg-audio-play-icon" aria-label="Play audio"></button></div>
	</div>
</div>
<figure class="kg-card kg-video-card kg-width-wide kg-card-hascaption">
	<div class="kg-video-container">
		<video width="1120" height="630" poster="${thumb(45, 1120, 630)}" playsinline preload="metadata"></video>
		<div class="kg-video-overlay"><button class="kg-video-large-play-icon" aria-label="Play video"></button></div>
		<div class="kg-video-player-container"><div class="kg-video-player"></div></div>
	</div>
	<figcaption>A wide video card: the browser's own controls replace Ghost's player.</figcaption>
</figure>
<figure class="kg-card kg-embed-card kg-card-hascaption">
	<iframe width="640" height="180" title="A placeholder podcast player" srcdoc="<p style='font-family: sans-serif'>A podcast player, wider than it is tall.</p>"></iframe>
	<figcaption>An embed keeps its own aspect ratio: this player is 640 by 180.</figcaption>
</figure>

<h2>Signup forms</h2>
<p>Ghost renders a signup card hidden, for its script to show and submit. A site that wires the form itself shows it and sets the state classes on the form; darksite styles them.</p>`;

	const states = [
		{ value: '', label: 'Ready' },
		{ value: 'loading', label: 'Loading' },
		{ value: 'success', label: 'Success' },
		{ value: 'error', label: 'Error' }
	];
	let state = $state('');
	const signup = $derived(`
<div class="kg-card kg-signup-card kg-width-wide kg-style-accent" data-lexical-signup-form style="">
	<div class="kg-signup-card-content">
		<div class="kg-signup-card-text kg-align-center">
			<h2 class="kg-signup-card-heading">Get the next post by email</h2>
			<p class="kg-signup-card-subheading">One message when something new is up.</p>
			<form class="kg-signup-card-form ${state}" data-members-form="signup">
				<div class="kg-signup-card-fields">
					<input class="kg-signup-card-input" id="email" data-members-email="" type="email" required="true" placeholder="Your email" aria-label="Email" />
					<button class="kg-signup-card-button kg-style-accent" style="color: #FFFFFF;" type="button">
						<span class="kg-signup-card-button-default">Subscribe</span>
						<span class="kg-signup-card-button-loading"><svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="4" cy="12" r="3"></circle><circle cx="12" cy="12" r="3"></circle><circle cx="20" cy="12" r="3"></circle></g></svg></span>
					</button>
				</div>
				<div class="kg-signup-card-success">Thanks. Check your inbox to confirm.</div>
				<div class="kg-signup-card-error" data-members-error>That address did not work. Try another.</div>
			</form>
			<p class="kg-signup-card-disclaimer">No more than one email a week.</p>
		</div>
	</div>
</div>`);

	const rest = `
<h2>Quotes, code and dividers</h2>
<blockquote class="kg-blockquote-alt">The alternate quote is large and centered, for a line worth setting apart.</blockquote>
<figure class="kg-card kg-code-card"><pre><code class="language-shell">tool export --since 2026-10-01 --format csv</code></pre><figcaption>A code card is the article's code block with a caption.</figcaption></figure>
<hr>
<p>A divider is a bare rule, as Ghost writes it.</p>`;
</script>

<svelte:head><title>Ghost content · darksite</title></svelte:head>
<!-- A post's HTML as Ghost's editor (Koenig) writes it, opted in with `ds-article-ghost`, with the
     `ghostCards` attachment for the cards' behavior. A real page renders it with {@html post.html}
     in the same place, after the header. -->
<article class="ds-article ds-article-ghost" {@attach ghostCards}>
	<header>
		<p class="ds-article-kicker ds-article-kicker-caps">Sample</p>
		<h1>Ghost content in an article</h1>
		<p class="ds-article-summary">
			The card markup the Ghost editor writes, mapped onto the article's columns and rhythm, with
			the little behavior the cards need.
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
	<p>
		A gallery is always wide: justified rows of images, each image whole at its own aspect ratio.
	</p>

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
		<figcaption>A video embed fills the text column at its own aspect ratio.</figcaption>
	</figure>

	{@html cards}
	<div><SegmentedControl options={states} bind:value={state} label="Signup state" /></div>
	{@html signup}
	{@html rest}

	<p>The cards keep the article's rhythm: more space around them than between paragraphs.</p>
</article>
