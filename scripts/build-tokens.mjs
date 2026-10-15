// Generates tokens.css from tokens.json. No dependencies.
//   node scripts/build-tokens.mjs           write src/lib/tokens.css
//   node scripts/build-tokens.mjs --check   fail if src/lib/tokens.css is stale
// tokens.json is the source of truth; never edit tokens.css by hand.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));

const themes = t.color.themes.map((x) => x.id);
const [first] = themes;
const ref = (v) => (typeof v === 'string' ? v.replace(/^\{(.+)\}$/, 'var(--$1)') : v);
// A theme's value for a token. A per-theme token a theme leaves out falls back to the theme it
// extends, then to the default theme, so a theme block is complete wherever it is applied.
// Theme-independent tokens (the ramps) are written once, on the default block only.
const themeById = Object.fromEntries(t.color.themes.map((x) => [x.id, x]));
const valueFor = (tok, theme) => {
	if (typeof tok.value === 'string') return theme === first ? tok.value : undefined;
	const base = themeById[theme]?.extends;
	return tok.value[theme] ?? (base ? tok.value[base] : undefined) ?? tok.value[first];
};

// Theme selection, strongest first:
//   1. an explicit attribute — data-ds-theme, or data-theme when data-ds-theme is absent;
//   2. a theme's `media` query, when :root carries no darksite theme (later themes in
//      tokens.json win, so prefers-contrast: more beats prefers-color-scheme: light);
//   3. the default (first) theme on :root.
// data-ds-theme exists for apps whose data-theme belongs to another library; a data-theme
// value that is not a darksite theme id is ignored. A theme that `extends` another also
// replaces an explicit choice of that theme under its media query (high contrast upgrades an
// explicit dark choice when the viewer asks for more contrast).
const explicit = (id) => [`[data-theme="${id}"]:not([data-ds-theme])`, `[data-ds-theme="${id}"]`];
const unchosen = `:root:not([data-ds-theme])${themes.map((id) => `:not([data-theme="${id}"])`).join('')}`;

const themed = [...t.color.tokens, ...(t.shadow?.tokens ?? [])];
const plainFamilies = [
	'fontSize',
	'lineHeight',
	'spacing',
	'radius',
	'control',
	'layout',
	'breakpoint',
	'duration',
	'easing',
	'zIndex'
];

const out = [
	`/* ${t.name} — generated from tokens.json by scripts/build-tokens.mjs. Do not edit. */`,
	''
];

function block(selectors, theme, indent = '') {
	out.push(`${indent}${selectors.join(`,\n${indent}`)} {`);
	out.push(`${indent}  color-scheme: ${themeById[theme].colorScheme ?? 'normal'};`);
	for (const tok of themed) {
		const v = valueFor(tok, theme);
		if (v !== undefined) out.push(`${indent}  --${tok.name}: ${ref(v)};`);
	}
	out.push(`${indent}}`);
}

block([':root', ...explicit(first)], first);
out.push('');
for (const theme of themes.slice(1)) {
	block(explicit(theme), theme);
	out.push('');
}
for (const theme of t.color.themes.filter((x) => x.media)) {
	out.push(`@media ${theme.media} {`);
	block([unchosen, ...(theme.extends ? explicit(theme.extends) : [])], theme.id, '  ');
	out.push('}', '');
}

out.push(':root {');
for (const fam of plainFamilies)
	for (const tok of t[fam]?.tokens ?? []) out.push(`  --${tok.name}: ${tok.value};`);
for (const [key, stack] of Object.entries(t.type.families)) out.push(`  --font-${key}: ${stack};`);
out.push('}', '');

for (const group of t.type.groups) {
	for (const s of group.styles) {
		out.push(`.ds-type-${s.name} {`);
		out.push(`  font-family: var(--font-${s.family ?? group.family});`);
		out.push(`  font-size: ${s.fontSize};`);
		if (s.lineHeight) out.push(`  line-height: ${s.lineHeight};`);
		if (s.fontWeight) out.push(`  font-weight: ${s.fontWeight};`);
		out.push('}');
	}
}
out.push('');

const target = join(root, 'src', 'lib', 'tokens.css');
const css = out.join('\n');
if (process.argv.includes('--check')) {
	if (!existsSync(target) || readFileSync(target, 'utf8') !== css) {
		console.error('src/lib/tokens.css is stale — run `npm run tokens`.');
		process.exit(1);
	}
	console.log('src/lib/tokens.css is up to date.');
} else {
	writeFileSync(target, css);
	console.log(`src/lib/tokens.css: ${themed.length} themed tokens, ${themes.length} themes`);
}
