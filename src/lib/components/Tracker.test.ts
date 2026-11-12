import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Tracker from './Tracker.svelte';

const steps = ['Asked', 'Checked', 'Approved', 'Downloading', 'Triaged', 'Filed'];

describe('Tracker', () => {
	it('is a list named by its summary, with the current step marked', () => {
		render(Tracker, { steps, current: 2 });
		const list = screen.getByRole('list', { name: 'Step 3 of 6: Approved' });
		const items = [...list.querySelectorAll('li')];
		expect(items.map((li) => li.getAttribute('data-state'))).toEqual([
			'complete',
			'complete',
			'current',
			'upcoming',
			'upcoming',
			'upcoming'
		]);
		expect(items.filter((li) => li.getAttribute('aria-current') === 'step')).toEqual([items[2]]);
		expect(items[0].textContent).toContain('complete');
	});

	it('marks a stopped step in its tone and says so', () => {
		render(Tracker, { steps, current: 3, state: 'stopped' });
		const list = screen.getByRole('list', { name: 'Step 4 of 6: Downloading' });
		expect(list.getAttribute('data-tone')).toBe('danger');
		const current = list.querySelector('[aria-current="step"]')!;
		expect(current.getAttribute('data-state')).toBe('stopped');
		expect(current.textContent).toContain('stopped');
	});

	it('takes the warning tone', () => {
		render(Tracker, { steps, current: 1, state: 'stopped', stoppedTone: 'warning' });
		expect(screen.getByRole('list').getAttribute('data-tone')).toBe('warning');
	});

	it('completes every step when done, with no current step', () => {
		render(Tracker, { steps, current: 5, state: 'done' });
		const list = screen.getByRole('list', { name: 'All 6 steps complete' });
		expect(list.querySelectorAll('[data-state="complete"]').length).toBe(6);
		expect(list.querySelector('[aria-current]')).toBeNull();
		expect(list.querySelector('[data-shown]')?.textContent).toContain('Filed');
	});

	it('clamps current and renders step titles as objects', () => {
		render(Tracker, { steps: [{ label: 'One', title: 'First' }, 'Two'], current: 9 });
		expect(screen.getByRole('list', { name: 'Step 2 of 2: Two' })).toBeTruthy();
		expect(screen.getByText('One')).toBeTruthy();
	});

	it('renders nothing without steps', () => {
		render(Tracker, { steps: [], current: 0 });
		expect(screen.queryByRole('list')).toBeNull();
	});
});
