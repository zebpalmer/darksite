import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Rating from './Rating.svelte';

describe('Rating', () => {
	it('is a radio group with one tab stop on the current value', () => {
		render(Rating, { value: 3, label: 'Quality' });
		const group = screen.getByRole('radiogroup', { name: 'Quality' });
		const stars = screen.getAllByRole('radio');
		expect(group).toBeTruthy();
		expect(stars).toHaveLength(5);
		expect(stars[2].getAttribute('aria-checked')).toBe('true');
		expect(stars[0].getAttribute('aria-label')).toBe('1 star');
		expect(stars[4].getAttribute('aria-label')).toBe('5 stars');
		expect(stars.map((s) => s.tabIndex)).toEqual([-1, -1, 0, -1, -1]);
	});

	it('steps with the arrows, jumps with Home and End, and clears with Delete', async () => {
		const onchange = vi.fn();
		render(Rating, { value: 3, label: 'Quality', onchange });
		const group = screen.getByRole('radiogroup');
		await fireEvent.keyDown(group, { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith(4);
		await fireEvent.keyDown(group, { key: 'ArrowLeft' });
		expect(onchange).toHaveBeenLastCalledWith(3);
		await fireEvent.keyDown(group, { key: 'End' });
		expect(onchange).toHaveBeenLastCalledWith(5);
		expect(document.activeElement).toBe(screen.getAllByRole('radio')[4]);
		await fireEvent.keyDown(group, { key: 'Home' });
		expect(onchange).toHaveBeenLastCalledWith(1);
		await fireEvent.keyDown(group, { key: 'Delete' });
		expect(onchange).toHaveBeenLastCalledWith(null);
	});

	it('clears when the current star is chosen again, or with an explicit Clear', async () => {
		const onchange = vi.fn();
		render(Rating, { value: 2, label: 'Quality', onchange, clearLabel: 'Clear' });
		await fireEvent.click(screen.getByRole('radio', { name: '2 stars' }));
		expect(onchange).toHaveBeenLastCalledWith(null);
		await fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
		expect(onchange).toHaveBeenLastCalledWith(4);
		await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
		expect(onchange).toHaveBeenLastCalledWith(null);
	});

	it('does not clear when clearable is off', async () => {
		const onchange = vi.fn();
		render(Rating, { value: 2, label: 'Quality', onchange, clearable: false });
		await fireEvent.click(screen.getByRole('radio', { name: '2 stars' }));
		expect(onchange).not.toHaveBeenCalled();
	});

	it('is one image when read-only', () => {
		const { container } = render(Rating, { value: 4, label: 'Quality', readonly: true });
		expect(screen.getByRole('img', { name: 'Quality: 4 of 5 stars' })).toBeTruthy();
		expect(screen.queryByRole('radio')).toBeNull();
		expect(container.querySelectorAll('.star[data-on]')).toHaveLength(4);
	});

	it('says when nothing is rated', () => {
		render(Rating, { value: null, label: 'Quality', readonly: true });
		expect(screen.getByRole('img', { name: 'Quality: Not rated' })).toBeTruthy();
	});
});
