// Generates the prebuilt brands from brand/presets.mjs: src/lib/brands/<name>.css (scoped to
// :root[data-brand="<name>"]) and src/lib/brands/index.json (names, labels and swatches, for a
// brand picker or a gallery). Fails if a brand cannot meet its contrast targets.
//   node scripts/build-brands.mjs           write
//   node scripts/build-brands.mjs --check   fail if the generated files are stale
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { brandCss, generateBrand } from '../brand/generate.mjs';
import { presets } from '../brand/presets.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const dir = join(root, 'src', 'lib', 'brands');
const check = process.argv.includes('--check');
const files = {};
const index = [];
let failed = false;

const SWATCH = [
	'ds-bg-0',
	'ds-bg-1',
	'ds-bg-3',
	'ds-text-1',
	'ds-text-2',
	'ds-accent',
	'ds-accent-2',
	'ds-success',
	'ds-warning',
	'ds-danger',
	'ds-rail-bg-0'
];
for (const preset of presets) {
	const g = generateBrand(tokens, preset);
	if (g.failures.length) {
		failed = true;
		console.error(`brand ${preset.name}:\n  ` + g.failures.join('\n  '));
	}
	files[`${preset.name}.css`] = brandCss(tokens, g, `:root[data-brand="${preset.name}"]`);
	index.push({
		name: preset.name,
		label: preset.label,
		scheme: !!preset.scheme,
		note: preset.note ?? null,
		swatches: Object.fromEntries(
			tokens.color.themes.map(({ id }) => [
				id,
				Object.fromEntries(SWATCH.map((r) => [r, g.resolve(id)(r)]))
			])
		)
	});
}
files['index.json'] = JSON.stringify(index, null, '\t') + '\n';
if (failed) process.exit(1);

if (check) {
	const stale = Object.entries(files).filter(
		([f, css]) => !existsSync(join(dir, f)) || readFileSync(join(dir, f), 'utf8') !== css
	);
	if (stale.length) {
		console.error(
			`src/lib/brands is stale (${stale.map(([f]) => f).join(', ')}) — run \`npm run brands\`.`
		);
		process.exit(1);
	}
	console.log(`src/lib/brands is up to date (${presets.length} brands).`);
} else {
	mkdirSync(dir, { recursive: true });
	for (const [f, css] of Object.entries(files)) writeFileSync(join(dir, f), css);
	console.log(`src/lib/brands: ${presets.length} brands.`);
}
