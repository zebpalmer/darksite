import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
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
		expect(button.hasAttribute('title')).toBe(false);
		expect(button.textContent?.trim()).toBe('');
		// The tooltip repeats the name, so it is hidden from assistive technology, not a description.
		const tip = document.querySelector('.ds-tooltip')!;
		expect(tip.textContent).toBe('Close');
		expect(tip.getAttribute('aria-hidden')).toBe('true');
		expect(button.hasAttribute('aria-describedby')).toBe(false);
	});

	it('turns a title into a tooltip that describes the button', () => {
		render(Button, { label: 'Export', title: 'Exports the filtered rows' });
		const button = screen.getByRole('button', { name: 'Export' });
		const tip = document.getElementById(button.getAttribute('aria-describedby')!)!;
		expect(tip.getAttribute('role')).toBe('tooltip');
		expect(tip.textContent).toBe('Exports the filtered rows');
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

	it('stays focusable as aria-disabled when disabled with a reason, and ignores clicks', async () => {
		const onclick = vi.fn();
		render(Button, { label: 'Export', disabled: true, reason: 'Select a row to export', onclick });
		const button = screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement;
		expect(button.disabled).toBe(false);
		expect(button.getAttribute('aria-disabled')).toBe('true');
		const tip = document.getElementById(button.getAttribute('aria-describedby')!)!;
		expect(tip.textContent).toBe('Select a row to export');
		const click = new MouseEvent('click', { bubbles: true, cancelable: true });
		button.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(true);
		expect(onclick).not.toHaveBeenCalled();
	});

	it('is natively disabled without a reason, and ignores the reason while enabled', async () => {
		const onclick = vi.fn();
		const { unmount } = render(Button, { label: 'Export', disabled: true, title: 'Exports the rows', onclick });
		const off = screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement;
		expect(off.disabled).toBe(true);
		expect(off.hasAttribute('aria-disabled')).toBe(false);
		unmount();
		render(Button, { label: 'Export', title: 'Exports the rows', reason: 'Select a row', onclick });
		const on = screen.getByRole('button', { name: 'Export' });
		expect(document.getElementById(on.getAttribute('aria-describedby')!)?.textContent).toBe('Exports the rows');
		await fireEvent.click(on);
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('keeps a disabled link with a reason in the tab order', () => {
		render(Button, { href: '/records', label: 'Records', disabled: true, reason: 'No records yet' });
		const link = screen.getByRole('link', { name: 'Records' });
		expect(link.getAttribute('tabindex')).toBe('0');
		expect(link.hasAttribute('href')).toBe(false);
	});

	it('does not call onclick on a disabled link', async () => {
		const onclick = vi.fn();
		render(Button, { href: '/records', label: 'Records', disabled: true, onclick });
		await fireEvent.click(screen.getByRole('link', { name: 'Records' }));
		expect(onclick).not.toHaveBeenCalled();
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

	it('passes native link attributes through, for a download or a full page load', () => {
		render(Button, {
			href: '/export.csv',
			label: 'Download',
			download: 'records.csv',
			'data-sveltekit-reload': '',
			rel: 'nofollow'
		});
		const link = screen.getByRole('link', { name: 'Download' });
		expect(link.getAttribute('download')).toBe('records.csv');
		expect(link.hasAttribute('data-sveltekit-reload')).toBe(true);
		expect(link.getAttribute('rel')).toBe('nofollow');
	});

	it('passes native button attributes through', () => {
		render(Button, { label: 'Save', type: 'submit', form: 'edit', name: 'intent', value: 'save' });
		const button = screen.getByRole('button', { name: 'Save' });
		expect(button.getAttribute('type')).toBe('submit');
		expect(button.getAttribute('form')).toBe('edit');
		expect(button.getAttribute('name')).toBe('intent');
		expect(button.getAttribute('value')).toBe('save');
	});
});
