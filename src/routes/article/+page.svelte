<script lang="ts">
	import { CodeBlock } from '#lib';
	import { thumb } from '../thumbs.js';
</script>

<svelte:head><title>Article page · darksite</title></svelte:head>
<article class="ds-article">
	<header>
		<p class="ds-article-kicker"><a href="/article">Guides</a></p>
		<h1>Writing release notes people read</h1>
		<p class="ds-article-summary">
			Most release notes are a list of commits with the hashes taken off. A few habits turn them
			into something a reader can act on in a minute.
		</p>
		<p class="ds-article-meta">
			<span>By A. Rivera</span>
			<time datetime="2026-10-04">October 4, 2026</time>
			<span>Updated October 14, 2026</span>
			<span>6 min read</span>
		</p>
	</header>

	<p>
		A release note has one job: to tell the person upgrading what changes for them. Everything else
		— who did the work, how long it took, which files moved — belongs in the history, where it is
		easy to find for anyone who wants it and out of the way for everyone else.
	</p>
	<p>
		That sounds obvious, and yet the notes most teams ship are written for the people who made the
		release, not the people who receive it. The fix is less about writing well than about deciding,
		before writing anything, who the reader is.
	</p>

	<h2>Start from the reader</h2>
	<p>
		Before a single line goes in, picture someone who skipped the last three versions and has ten
		minutes to decide whether to upgrade today. They want three things, in this order:
	</p>
	<ul>
		<li>What they must do, if anything, before or after upgrading.</li>
		<li>What now works differently, so nothing surprises them later.</li>
		<li>What is new, in case it saves them work they were about to do.</li>
	</ul>
	<p>
		Sorting every entry under one of those headings does most of the editing for you. An entry that
		fits none of them is usually an internal change, and can go.
	</p>

	<blockquote>
		<p>
			Write the note you would want to find on the morning something broke, not the one you would
			want to read on the afternoon it shipped.
		</p>
	</blockquote>

	<figure class="ds-article-wide">
		<img src={thumb(7, 1120, 440)} alt="A gradient placeholder standing in for a diagram" />
		<figcaption>
			A wide figure breaks out of the text column to the full width of the article.
		</figcaption>
	</figure>

	<h2>Say what changed, not what you did</h2>
	<p>
		"Refactored the export module" tells the reader nothing. "Exports of more than 10,000 rows no
		longer time out" tells them whether to care. Lead each entry with the effect, in plain past or
		present tense, and keep the cause for the history.
	</p>

	<h3>Name the breaking changes first</h3>
	<p>
		A change that needs the reader to act goes at the very top, under its own heading, with the
		exact step to take. If a setting was renamed, give the old name and the new one side by side.
	</p>

	<div class="ds-article-wide">
		<table>
			<thead>
				<tr><th>Old setting</th><th>New setting</th><th>What to do</th></tr>
			</thead>
			<tbody>
				<tr
					><td><code>export.limit</code></td><td><code>export.max_rows</code></td><td
						>Rename it; the value carries over.</td
					></tr
				>
				<tr
					><td><code>cache.ttl</code></td><td><code>cache.ttl_seconds</code></td><td
						>Rename it and give the value in seconds.</td
					></tr
				>
				<tr
					><td><code>legacy_mode</code></td><td>—</td><td>Remove it; the old behavior is gone.</td
					></tr
				>
			</tbody>
		</table>
	</div>

	<h3>Show the command</h3>
	<p>
		When the step is a command, show the command. A reader copies it far more reliably than they
		follow a sentence describing it.
	</p>
	<CodeBlock size="comfy" code="tool config rename export.limit export.max_rows" label="Shell" />

	<h2>Keep it short enough to finish</h2>
	<p>
		The best test of a release note is whether someone reads it to the end. Cut the entries nobody
		outside the team would miss, link to the full history for the rest, and let the note be short. A
		reader who finishes it trusts the next one.
	</p>
	<p>
		This page is written by hand. The same layout takes a post from the Ghost CMS as it arrives:
		<a href="/article/ghost">the Ghost content sample</a> shows its cards.
	</p>
</article>
