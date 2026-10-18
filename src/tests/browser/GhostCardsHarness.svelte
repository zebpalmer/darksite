<script lang="ts">
	import { AppShell, ghostCards, type NavItem } from '#lib';
	let { enhance = true }: { enhance?: boolean } = $props();
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'posts', label: 'Posts', href: '/posts' }
	];
	// Flat synthetic images of known sizes; white is the worst case for text over an image.
	const img = (w: number, h: number, fill = 'gray') =>
		`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${fill}"/></svg>`)}`;
	const star = '<svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-6 5 2 8-6-4-6 4 2-8-6-5h7z"/></svg>';
	const stars = (n: number) =>
		[1, 2, 3, 4, 5]
			.map(
				(i) =>
					`<span class="${i <= n ? 'kg-product-card-rating-active' : ''} kg-product-card-rating-star">${star}</span>`
			)
			.join('');
	const signup = (id: string, formClass = '', style = '') => `
<div class="kg-card kg-signup-card kg-width-regular" data-testid="${id}" data-lexical-signup-form style="${style}">
	<div class="kg-signup-card-content"><div class="kg-signup-card-text">
		<h2 class="kg-signup-card-heading">Get the next post</h2>
		<p class="kg-signup-card-subheading">One email when something new is up.</p>
		<form class="kg-signup-card-form ${formClass}" data-members-form="signup">
			<div class="kg-signup-card-fields">
				<input class="kg-signup-card-input" type="email" required placeholder="Your email" aria-label="Email" />
				<button class="kg-signup-card-button kg-style-accent" type="submit">
					<span class="kg-signup-card-button-default">Subscribe</span>
					<span class="kg-signup-card-button-loading"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg></span>
				</button>
			</div>
			<div class="kg-signup-card-success">Check your inbox.</div>
			<div class="kg-signup-card-error">That address did not work.</div>
		</form>
		<p class="kg-signup-card-disclaimer">No spam.</p>
	</div></div>
</div>`;

	// Ghost's (Koenig's) web output for each card, as a post's HTML arrives.
	const html = `
<p data-testid="para">A paragraph of body text, long enough to fill the text column from one edge to the other at the article's measure, so its width is the column's width.</p>
<div class="kg-card kg-button-card kg-align-center" data-testid="button"><a href="/b" class="kg-btn kg-btn-accent">Read the guide</a></div>
<div class="kg-card kg-button-card kg-align-left" data-testid="button-left"><a href="/b" class="kg-btn">Another button</a></div>
<div class="kg-card kg-header-card kg-width-full kg-size-large kg-style-image" data-testid="header-image" data-kg-background-image="${img(1600, 600, 'white')}" style="background-image: url(&quot;${img(1600, 600, 'white')}&quot;)">
	<h2 class="kg-header-card-header" id="a-header">A header over an image</h2>
	<h3 class="kg-header-card-subheader" id="a-sub">With a subheader under it</h3>
	<a class="kg-header-card-button" href="/h">Start</a>
</div>
<div class="kg-card kg-header-card kg-width-full kg-size-small kg-style-dark" data-testid="header-dark">
	<h2 class="kg-header-card-header">A small dark header</h2>
</div>
<div class="kg-card kg-header-card kg-width-full kg-size-medium kg-style-accent" data-testid="header-accent">
	<h2 class="kg-header-card-header">An accent header</h2>
	<h3 class="kg-header-card-subheader">Its subheader</h3>
</div>
<div class="kg-card kg-header-card kg-v2 kg-width-regular" style="background-color: #000000;" data-background-color="#000000" data-testid="header-v2">
	<div class="kg-header-card-content"><div class="kg-header-card-text kg-align-center">
		<h2 id="v2" class="kg-header-card-heading" style="color: #FFFFFF;" data-text-color="#FFFFFF">A v2 header</h2>
		<p class="kg-header-card-subheading" style="color: #FFFFFF;" data-text-color="#FFFFFF">Its subheading</p>
		<a href="/v2" class="kg-header-card-button kg-style-accent" style="color: #FFFFFF;" data-button-color="accent">Join</a>
	</div></div>
</div>
<div class="kg-card kg-header-card kg-v2 kg-width-wide" data-background-color="#000000" data-testid="header-v2-image">
	<picture><img class="kg-header-card-image" src="${img(1200, 600, 'white')}" loading="lazy" alt="" /></picture>
	<div class="kg-header-card-content"><div class="kg-header-card-text">
		<h2 class="kg-header-card-heading" style="color: #FFFFFF;">A wide v2 header on an image</h2>
	</div></div>
</div>
<div class="kg-card kg-header-card kg-v2 kg-layout-split kg-width-full kg-swapped" style="background-color: #F0F0F0;" data-testid="header-split">
	<div class="kg-header-card-content">
		<picture><img class="kg-header-card-image" src="${img(800, 800)}" alt="" /></picture>
		<div class="kg-header-card-text">
			<h2 class="kg-header-card-heading">A split header</h2>
			<p class="kg-header-card-subheading">Text beside an image</p>
		</div>
	</div>
</div>
<div class="kg-card kg-file-card" data-testid="file">
	<a class="kg-file-card-container" href="/f.pdf" title="Download" download="">
		<div class="kg-file-card-contents">
			<div class="kg-file-card-title">Field checklist</div>
			<div class="kg-file-card-caption">Two pages, printable.</div>
			<div class="kg-file-card-metadata"><div class="kg-file-card-filename">a-long-file-name-for-the-field-checklist-that-has-to-truncate.pdf</div><div class="kg-file-card-filesize">48 KB</div></div>
		</div>
		<div class="kg-file-card-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11"/></svg></div>
	</a>
</div>
<div class="kg-card kg-product-card" data-testid="product">
	<div class="kg-product-card-container">
		<img src="${img(560, 320)}" width="560" height="320" class="kg-product-card-image" loading="lazy" />
		<div class="kg-product-card-title-container"><h4 class="kg-product-card-title">A sample product</h4></div>
		<div class="kg-product-card-rating">${stars(4)}</div>
		<div class="kg-product-card-description"><p>A sentence about it.</p></div>
		<a href="/p" class="kg-product-card-button kg-product-card-btn-accent" target="_blank" rel="noopener noreferrer"><span>Buy</span></a>
	</div>
</div>
<div class="kg-card kg-cta-card kg-cta-bg-grey kg-cta-minimal kg-cta-has-img" data-layout="minimal" data-testid="cta">
	<div class="kg-cta-sponsor-label-wrapper"><div class="kg-cta-sponsor-label"><span style="white-space: pre-wrap;">Sponsored</span></div></div>
	<div class="kg-cta-content">
		<div class="kg-cta-image-container"><a href="/c"><img src="${img(128, 128)}" alt="CTA Image"></a></div>
		<div class="kg-cta-content-inner">
			<div class="kg-cta-text"><p>A short pitch, with <a href="/c">a link</a> in it.</p></div>
			<a href="/c" class="kg-cta-button" style="background-color: #000000; color: #ffffff;">Learn more</a>
		</div>
	</div>
</div>
<div class="kg-card kg-cta-card kg-cta-bg-green kg-cta-immersive kg-cta-centered kg-cta-has-img" data-layout="immersive" data-testid="cta-immersive">
	<div class="kg-cta-content">
		<div class="kg-cta-image-container"><img src="${img(720, 300)}" alt="CTA Image"></div>
		<div class="kg-cta-content-inner">
			<div class="kg-cta-text"><p>A stacked pitch.</p></div>
			<a href="/c" class="kg-cta-button kg-style-accent" style="color: #ffffff;">Learn more</a>
		</div>
	</div>
</div>
${signup('signup')}
${signup('signup-success', 'success')}
${signup('signup-error', 'error')}
${signup('signup-loading', 'loading')}
${signup('signup-hidden', '', 'background-color: #F0F0F0; display: none;')}
<div class="kg-card kg-toggle-card" data-kg-toggle-state="close" data-testid="toggle">
	<div class="kg-toggle-heading">
		<h4 class="kg-toggle-heading-text">A question</h4>
		<button class="kg-toggle-card-icon" aria-label="Expand toggle to read content"><svg viewBox="0 0 24 24"><path d="M23.25,7.311,12.53,18.03a.749.749,0,0,1-1.06,0L.75,7.311"></path></svg></button>
	</div>
	<div class="kg-toggle-content"><p>Its answer.</p></div>
</div>
<div class="kg-card kg-audio-card" data-testid="audio">
	<img src="${img(64, 64)}" alt="audio-thumbnail" class="kg-audio-thumbnail" />
	<div class="kg-audio-thumbnail placeholder kg-audio-hide"><svg width="24" height="24" fill="none"><path d="M3 2h18v20H3z"/></svg></div>
	<div class="kg-audio-player-container">
		<audio preload="metadata"></audio>
		<div class="kg-audio-title">Episode one</div>
		<div class="kg-audio-player"><button class="kg-audio-play-icon" aria-label="Play audio"></button></div>
	</div>
</div>
<figure class="kg-card kg-video-card kg-width-wide kg-card-hascaption" data-testid="video">
	<div class="kg-video-container">
		<video width="640" height="360" poster="${img(640, 360)}" playsinline preload="metadata"></video>
		<div class="kg-video-overlay"><button class="kg-video-large-play-icon" aria-label="Play video"></button></div>
		<div class="kg-video-player-container"><div class="kg-video-player"></div></div>
	</div>
	<figcaption>A video caption.</figcaption>
</figure>
<figure class="kg-card kg-gallery-card kg-width-wide" data-testid="gallery">
	<div class="kg-gallery-container"><div class="kg-gallery-row">
		<div class="kg-gallery-image"><img src="${img(300, 200)}" width="300" height="200" alt="" /></div>
		<div class="kg-gallery-image"><img src="${img(200, 300)}" width="200" height="300" alt="" /></div>
		<div class="kg-gallery-image"><img src="${img(300, 300)}" width="300" height="300" alt="" /></div>
	</div></div>
</figure>
<figure class="kg-card kg-embed-card" data-testid="embed-video"><iframe width="200" height="113" title="A video player" srcdoc="<p>Player</p>"></iframe></figure>
<figure class="kg-card kg-embed-card" data-testid="embed-audio"><iframe width="640" height="180" title="A podcast player" srcdoc="<p>Podcast</p>"></iframe></figure>
<figure class="kg-card kg-embed-card" data-testid="embed-percent"><iframe width="100%" height="180" title="A percent player" srcdoc="<p>Podcast</p>"></iframe></figure>
<figure class="kg-card kg-transistor-card" data-testid="transistor"><iframe width="100%" height="180" frameborder="no" scrolling="no" seamless="" title="A podcast" srcdoc="<p>Podcast</p>"></iframe></figure>
<blockquote class="kg-blockquote-alt" data-testid="quote">A large quote, set apart.</blockquote>
<figure class="kg-card kg-code-card" data-testid="code"><pre><code class="language-shell">tool run --all</code></pre><figcaption>A caption under the code.</figcaption></figure>
<hr data-testid="hr">
<p>The end.</p>`;
</script>

<AppShell {items} current="posts" nav="top" product="Product" toaster={false}>
	<article class="ds-article ds-article-ghost" {@attach enhance && ghostCards}>
		<header>
			<h1>A title for the article</h1>
		</header>
		{@html html}
	</article>
</AppShell>
