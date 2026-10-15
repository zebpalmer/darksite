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
const [first, ...rest] = themes;
const ref = (v) => (typeof v === 'string' ? v.replace(/^\{(.+)\}$/, 'var(--$1)') : v);
const valueFor = (tok, theme) =>
	typeof tok.value === 'string' ? (theme === first ? tok.value : undefined) : tok.value[theme];

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
	'easing'
];

const out = [
	`/* ${t.name} — generated from tokens.json by scripts/build-tokens.mjs. Do not edit. */`,
	''
];

out.push(`:root,\n[data-theme="${first}"] {`);
for (const tok of themed) out.push(`  --${tok.name}: ${ref(valueFor(tok, first))};`);
out.push('}', '');

for (const theme of rest) {
	out.push(`[data-theme="${theme}"] {`);
	for (const tok of themed) {
		const v = valueFor(tok, theme);
		if (v !== undefined) out.push(`  --${tok.name}: ${ref(v)};`);
	}
	out.push('}', '');
}

// A theme with `media` also applies on its own when the viewer asks for it through that media
// query and has not chosen another theme explicitly.
for (const theme of t.color.themes.filter((x) => x.media)) {
	out.push(`@media ${theme.media} {`, `  :root:not([data-theme]),`, `  [data-theme="${first}"] {`);
	for (const tok of themed) {
		const v = valueFor(tok, theme.id);
		if (v !== undefined) out.push(`    --${tok.name}: ${ref(v)};`);
	}
	out.push('  }', '}', '');
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
