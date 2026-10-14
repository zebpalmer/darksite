// darksite — Svelte 5 components for operator software.
// Load the stylesheets once at the root:
//   import 'darksite/tokens.css';
//   import 'darksite/base.css';

export { default as Button } from './components/Button.svelte';
export { default as KeyCap } from './components/KeyCap.svelte';
export { default as Spinner } from './components/Spinner.svelte';

export { formatKey, formatKeys } from './keycap.js';
export type { ControlSize, IconComponent } from './types.js';
