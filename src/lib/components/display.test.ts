import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Meter from './Meter.svelte';
import SeverityBadge from './SeverityBadge.svelte';
import SourceBadge from './SourceBadge.svelte';
import Stat from './Stat.svelte';
import StatusBadge from './StatusBadge.svelte';

describe('StatusBadge', () => {
	it('shows its label and how long the state has held', () => {
		const { container } = render(StatusBadge, {
			label: 'On hold',
			tone: 'warning',
			since: '2026-10-02T12:00:00Z',
			now: '2026-10-14T12:00:00Z'
		});
		const badge = container.querySelector('.ds-status') as HTMLElement;
		expect(badge.dataset.tone).toBe('warning');
		const age = badge.querySelector('.age') as HTMLElement;
		expect(age.textContent).toContain('12 days');
		// The dot is decoration; a screen reader hears "On hold, for 12 days".
		expect(age.querySelector('[aria-hidden="true"]')?.textContent).toBe('·');
		expect(age.querySelector('.ds-sr-only')?.textContent).toBe(', for');
	});
});

describe('SeverityBadge', () => {
	it('shows the name, never the index, with a position bar on request', () => {
		const { container } = render(SeverityBadge, { severity: 'high', pips: true });
		expect(container.textContent).toContain('High');
		expect(container.querySelectorAll('.pip[data-on]')).toHaveLength(4);
	});

	it('renders nothing when unset', () => {
		const { container } = render(SeverityBadge, { severity: null });
		expect(container.querySelector('.ds-sev')).toBeNull();
	});
});

describe('SourceBadge', () => {
	it('shows the source with its confidence as a percentage', () => {
		const { container } = render(SourceBadge, { source: 'Registry', confidence: 0.96 });
		expect(container.textContent?.replace(/\s/g, ' ').trim()).toBe('Registry 96%');
	});
});

describe('Stat', () => {
	it('is a block with a localized value, or a link when given an href', () => {
		const { unmount } = render(Stat, { label: 'Open', value: 12408, of: 20000, meta: '185 open · 78 blocked' });
		expect(screen.getByText('12,408')).toBeTruthy();
		expect(screen.getByText('of 20,000')).toBeTruthy();
		expect(screen.queryByRole('link')).toBeNull();
		unmount();
		render(Stat, { label: 'Open', value: 3, href: '/open', severity: 'critical' });
		const link = screen.getByRole('link');
		expect(link.getAttribute('href')).toBe('/open');
		expect(link.textContent).toContain('Critical');
	});
});

describe('Meter', () => {
	it('is a meter that states every segment in words', () => {
		render(Meter, {
			label: 'Records by state',
			max: 30,
			segments: [
				{ label: 'Done', value: 12, tone: 'success' },
				{ label: 'In progress', value: 5 },
				{ label: 'Blocked', value: 2 }
			]
		});
		const meter = screen.getByRole('meter', { name: 'Records by state' });
		expect(meter.getAttribute('aria-valuenow')).toBe('19');
		expect(meter.getAttribute('aria-valuemax')).toBe('30');
		expect(meter.getAttribute('aria-valuetext')).toBe('Done 12, In progress 5, Blocked 2 of 30');
		expect(meter.querySelectorAll('.seg')).toHaveLength(3);
	});

	it('is a progressbar when it shows progress', () => {
		render(Meter, { label: 'Import', kind: 'progress', max: 10, segments: [{ label: 'Done', value: 4 }] });
		expect(screen.getByRole('progressbar', { name: 'Import' })).toBeTruthy();
	});
});
