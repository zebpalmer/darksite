#!/usr/bin/env node
// darksite-theme — generate a product's brand CSS from a brand file.
//
//   npx darksite-theme brand.json --out src/brand.css      write the brand for the whole app
//   npx darksite-theme brand.json --scope brand            scope it to :root[data-brand="<name>"]
//   npx darksite-theme --preset nord > brand.json          start from a prebuilt brand
//   npx darksite-theme --list                              list the prebuilt brands
//
// The brand file is JSON (or an .mjs module whose default export is the brand). Import the output
// after darksite's tokens.css. Every documented contrast pair is checked in every mode; a color
// that falls short is nudged in lightness and reported, and a brand that cannot pass exits 1.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brandCss, generateBrand } from '../brand/generate.mjs';
import { presets } from '../brand/presets.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '..', 'tokens.json'), 'utf8'));
const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};

if (args.includes('--help') || args.length === 0) {
	console.log(
		readFileSync(fileURLToPath(import.meta.url), 'utf8')
			.split('\n')
			.slice(1, 12)
			.map((l) => l.replace(/^\/\/ ?/, ''))
			.join('\n')
	);
	process.exit(0);
}
if (args.includes('--list')) {
	for (const p of presets)
		console.log(`${p.name.padEnd(12)} ${p.label}${p.scheme ? ' (color scheme)' : ''}`);
	process.exit(0);
}
const presetName = flag('--preset');
if (presetName) {
	const p = presets.find((x) => x.name === presetName);
	if (!p) {
		console.error(`No preset "${presetName}". Run --list.`);
		process.exit(1);
	}
	const { label, note, scheme, ...brand } = p;
	console.log(JSON.stringify({ ...brand, name: 'my-brand' }, null, 2));
	process.exit(0);
}

const file = resolve(
	args.find((a) => !a.startsWith('--') && a !== flag('--out') && a !== flag('--scope'))
);
const brand = file.endsWith('.json')
	? JSON.parse(readFileSync(file, 'utf8'))
	: (await import(pathToFileURL(file).href)).default;
brand.name ??= 'brand';

const g = generateBrand(tokens, brand);
if (!args.includes('--quiet')) for (const n of g.notes) console.error(`adjusted  ${n}`);
if (g.failures.length) {
	for (const f of g.failures) console.error(`FAIL      ${f}`);
	console.error(`${g.failures.length} contrast failure(s): change the colors named above.`);
	process.exit(1);
}
const scope = flag('--scope') === 'brand' ? `:root[data-brand="${brand.name}"]` : ':root';
const css = brandCss(tokens, g, scope);
const out = flag('--out');
if (out) {
	writeFileSync(out, css);
	console.error(
		`${out}: brand "${brand.name}", ${Object.keys(g.modes[tokens.color.themes[0].id]).length} roles, ${g.notes.length} adjustment(s).`
	);
} else process.stdout.write(css);
