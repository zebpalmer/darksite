import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
	it('renders a type="button" button with its label, secondary by default', () => {
		render(Button, { label: 'Save' });
		const button = screen.getByRole('button', { name: 'Save' });
		expect(button.getAttribute('type')).toBe('button');
		expect(button.dataset.variant).toBe('secondary');
		expect(button.dataset.size).toBe('default');
	});

	it('names an icon button by its label and shows it as a tooltip, with no visible text', () => {
		render(Button, { variant: 'icon', label: 'Close' });
		const button = screen.getByRole('button', { name: 'Close' });
		expect(button.getAttribute('title')).toBe('Close');
		expect(button.textContent?.trim()).toBe('');
	});

	it('renders a link when given an href', () => {
		render(Button, { href: '/records', label: 'Records' });
		expect(screen.getByRole('link', { name: 'Records' }).getAttribute('href')).toBe('/records');
	});

	it('keeps a disabled link in the accessibility tree without an href', () => {
		render(Button, { href: '/records', label: 'Records', disabled: true });
		const link = screen.getByRole('link', { name: 'Records' });
		expect(link.hasAttribute('href')).toBe(false);
		expect(link.getAttribute('aria-disabled')).toBe('true');
	});

	it('is busy and inert while loading, and shows the -ing label', () => {
		render(Button, { label: 'Save', loading: true, loadingLabel: 'Saving' });
		const button = screen.getByRole('button', { name: 'Saving' });
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect((button as HTMLButtonElement).disabled).toBe(true);
	});

	it('announces its hotkey and draws the cap as decoration', () => {
		const { container } = render(Button, { label: 'Save', keycap: 'shift+enter', variant: 'primary' });
		expect(screen.getByRole('button').getAttribute('aria-keyshortcuts')).toBe('shift+enter');
		const kbd = container.querySelector('kbd');
		expect(kbd?.textContent).toBe('⇧Enter');
		expect(kbd?.getAttribute('aria-hidden')).toBe('true');
		expect(kbd?.dataset.tone).toBe('primary');
	});

	it('reports a toggle state through aria-pressed', () => {
		render(Button, { label: 'Repeat', pressed: true });
		expect(screen.getByRole('button', { name: 'Repeat' }).getAttribute('aria-pressed')).toBe('true');
	});
});
