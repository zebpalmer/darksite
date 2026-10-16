// The prebuilt brands. Each is the input the generator takes, so a product can copy one as the
// starting point for its own. The named schemes take their colors from open-source editor color
// schemes (credited in NOTICE.md); darksite fills in the modes a scheme does not define and nudges
// any color that misses a contrast target.

export const presets = [
	{ name: 'violet', label: 'Violet', note: 'The default.' },
	{ name: 'blue', label: 'Blue', accent: '#5b8def', neutral: { hue: 255, chroma: 1 } },
	{ name: 'teal', label: 'Teal', accent: '#2bb3a8', neutral: { hue: 200, chroma: 0.6 } },
	{ name: 'green', label: 'Green', accent: '#4fb477', neutral: { hue: 160, chroma: 0.5 } },
	{ name: 'amber', label: 'Amber', accent: '#e0a43a', neutral: { hue: 70, chroma: 0.6 } },
	{ name: 'rose', label: 'Rose', accent: '#d6728f', neutral: { hue: 30, chroma: 0.6 } },
	{ name: 'graphite', label: 'Graphite', accent: '#aab0c0', neutral: { hue: 260, chroma: 0.15 } },
	{
		name: 'harbor',
		label: 'Harbor',
		note: 'A colored rail: the chrome has its own color in every mode.',
		accent: '#2bb3a8',
		neutral: { hue: 220, chroma: 0.7 },
		chrome: { rail: '#0f2a3a' }
	},
	{
		name: 'nord',
		label: 'Nord',
		scheme: true,
		surfaces: {
			dark: { bg: '#2e3440', text: '#d8dee9' },
			light: { bg: '#eceff4', text: '#2e3440' }
		},
		accent: { dark: '#88c0d0', light: '#5e81ac' },
		accent2: { dark: '#b48ead', light: '#b48ead' },
		success: { dark: '#a3be8c' },
		warning: { dark: '#ebcb8b' },
		danger: { dark: '#bf616a' }
	},
	{
		name: 'dracula',
		label: 'Dracula',
		scheme: true,
		surfaces: { dark: { bg: '#282a36', text: '#f8f8f2' } },
		neutral: { hue: 277, chroma: 0.8 },
		accent: { dark: '#bd93f9' },
		accent2: { dark: '#ff79c6' },
		success: { dark: '#50fa7b' },
		warning: { dark: '#f1fa8c' },
		danger: { dark: '#ff5555' }
	},
	{
		name: 'solarized',
		label: 'Solarized',
		scheme: true,
		surfaces: {
			dark: { bg: '#002b36', text: '#93a1a1' },
			light: { bg: '#fdf6e3', text: '#586e75' }
		},
		accent: { dark: '#268bd2', light: '#268bd2' },
		accent2: { dark: '#2aa198', light: '#2aa198' },
		success: { dark: '#859900', light: '#859900' },
		warning: { dark: '#b58900', light: '#b58900' },
		danger: { dark: '#dc322f', light: '#dc322f' }
	},
	{
		name: 'gruvbox',
		label: 'Gruvbox',
		scheme: true,
		surfaces: {
			dark: { bg: '#282828', text: '#ebdbb2' },
			light: { bg: '#fbf1c7', text: '#3c3836' }
		},
		accent: { dark: '#fe8019', light: '#af3a03' },
		accent2: { dark: '#8ec07c', light: '#427b58' },
		success: { dark: '#b8bb26', light: '#79740e' },
		warning: { dark: '#fabd2f', light: '#b57614' },
		danger: { dark: '#fb4934', light: '#9d0006' }
	},
	{
		name: 'catppuccin',
		label: 'Catppuccin',
		scheme: true,
		surfaces: {
			dark: { bg: '#1e1e2e', text: '#cdd6f4' },
			light: { bg: '#eff1f5', text: '#4c4f69' }
		},
		accent: { dark: '#cba6f7', light: '#8839ef' },
		accent2: { dark: '#89b4fa', light: '#1e66f5' },
		success: { dark: '#a6e3a1', light: '#40a02b' },
		warning: { dark: '#f9e2af', light: '#df8e1d' },
		danger: { dark: '#f38ba8', light: '#d20f39' }
	},
	{
		name: 'tokyo-night',
		label: 'Tokyo Night',
		scheme: true,
		surfaces: {
			dark: { bg: '#1a1b26', text: '#c0caf5' },
			light: { bg: '#e1e2e7', text: '#3760bf' }
		},
		accent: { dark: '#7aa2f7', light: '#2e7de9' },
		accent2: { dark: '#bb9af7', light: '#9854f1' },
		success: { dark: '#9ece6a', light: '#587539' },
		warning: { dark: '#e0af68', light: '#8c6c3e' },
		danger: { dark: '#f7768e', light: '#f52a65' }
	},
	{
		name: 'rose-pine',
		label: 'Rosé Pine',
		scheme: true,
		surfaces: {
			dark: { bg: '#191724', text: '#e0def4' },
			light: { bg: '#faf4ed', text: '#575279' }
		},
		accent: { dark: '#c4a7e7', light: '#907aa9' },
		accent2: { dark: '#ebbcba', light: '#d7827e' },
		warning: { dark: '#f6c177', light: '#ea9d34' },
		danger: { dark: '#eb6f92', light: '#b4637a' }
	},
	{
		name: 'one-dark',
		label: 'One Dark',
		scheme: true,
		surfaces: {
			dark: { bg: '#282c34', text: '#abb2bf' },
			light: { bg: '#fafafa', text: '#383a42' }
		},
		accent: { dark: '#61afef', light: '#4078f2' },
		accent2: { dark: '#c678dd', light: '#a626a4' },
		success: { dark: '#98c379', light: '#50a14f' },
		warning: { dark: '#e5c07b', light: '#c18401' },
		danger: { dark: '#e06c75', light: '#e45649' }
	}
];
