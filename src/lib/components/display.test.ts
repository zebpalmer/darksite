import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import HelpTip from './HelpTip.svelte';
import Pane from './Pane.svelte';
import Meter from './Meter.svelte';
import SeverityBadge from './SeverityBadge.svelte';
import SourceBadge from './SourceBadge.svelte';
import Stat from './Stat.svelte';
import StatusBadge from './StatusBadge.svelte';
import { defineScale } from '../scale.js';

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

describe('StatusBadge info', () => {
	it('takes the info tone', () => {
		const { container } = render(StatusBadge, { label: 'Scheduled', tone: 'info' });
		expect((container.querySelector('.ds-status') as HTMLElement).dataset.tone).toBe('info');
	});
});

describe('StatusBadge until', () => {
	const now = new Date(2026, 9, 14, 15, 0);
	const badge = (until: string | Date, tone?: 'success') => {
		const { container, unmount } = render(StatusBadge, { label: 'Review', until, now, tone });
		const el = container.querySelector('.ds-status') as HTMLElement;
		const text = el.querySelector('.due')?.textContent?.replace(/\s+/g, ' ').trim();
		const out = { tone: el.dataset.tone, text, title: el.getAttribute('title') };
		unmount();
		return out;
	};

	it('counts down to a due date, then counts the days overdue', () => {
		expect(badge('2026-10-17').text).toBe('·, due in 3 days');
		expect(badge('2026-10-15').text).toBe('·, due in 1 day');
		expect(badge('2026-10-14').text).toBe('·, due today');
		expect(badge('2026-10-13').text).toBe('·, 1 day overdue');
		expect(badge(new Date(2026, 9, 12, 23, 0)).text).toBe('·, 2 days overdue');
	});

	it('takes its tone from the date unless one is given', () => {
		expect(badge('2026-10-17').tone).toBe('neutral');
		expect(badge('2026-10-14').tone).toBe('warning');
		expect(badge('2026-10-12').tone).toBe('danger');
		expect(badge('2026-10-12', 'success').tone).toBe('success');
	});

	it('puts the due date in the tooltip as a date, not a UTC midnight', () => {
		expect(badge('2026-10-17').title).toBe(
			`Due ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(2026, 9, 17))}`
		);
	});
});

describe('Pane', () => {
	const children = createRawSnippet(() => ({ render: () => '<p>Body</p>' }));

	it('is a disclosure when collapsible: the title button toggles the body', async () => {
		render(Pane, { title: 'Activity', meta: '12 entries', collapsible: true, children });
		const toggle = screen.getByRole('button', { name: /Activity/ });
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		const body = document.getElementById(toggle.getAttribute('aria-controls')!)!;
		expect(body.hidden).toBe(false);
		await fireEvent.click(toggle);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(body.hidden).toBe(true);
		expect(screen.getByRole('heading', { level: 2 }).contains(toggle)).toBe(true);
	});

	it('can start collapsed, or collapse when it mounts narrower than collapseBelow', () => {
		const { unmount } = render(Pane, { title: 'Activity', collapsible: true, open: false, children });
		expect(screen.getByRole('button', { name: /Activity/ }).getAttribute('aria-expanded')).toBe('false');
		unmount();
		const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
		render(Pane, { title: 'History', collapsible: true, collapseBelow: 480, children });
		expect(screen.getByRole('button', { name: /History/ }).getAttribute('aria-expanded')).toBe('false');
		width.mockRestore();
	});

	it('has no button when it is not collapsible', () => {
		render(Pane, { title: 'Activity', children });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByText('Body')).toBeTruthy();
	});

	it('names its tip button with tipLabel', () => {
		const { unmount } = render(Pane, { title: 'Activity', tip: 'Newest first', children });
		expect(screen.getByRole('button', { name: 'More information' })).toBeTruthy();
		unmount();
		render(Pane, { title: 'Activity', tip: 'Newest first', tipLabel: 'About activity', children });
		const button = screen.getByRole('button', { name: 'About activity' });
		expect(button.getAttribute('aria-describedby')).toBeTruthy();
		expect(screen.getByRole('tooltip').textContent).toBe('Newest first');
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

	it('shows the missing-value mark for an empty value, and zero as a value', () => {
		for (const value of [null, undefined, '']) {
			const { container, unmount } = render(Stat, { label: 'Median age', value, unit: 'days' });
			const shown = container.querySelector('.value') as HTMLElement;
			expect(shown.querySelector('.ds-missing')).toBeTruthy();
			expect(shown.textContent).toContain('No value');
			expect(container.textContent).not.toContain('days');
			unmount();
		}
		const { container } = render(Stat, { label: 'Blocked', value: 0 });
		expect(container.querySelector('.ds-missing')).toBeNull();
		expect(container.querySelector('.value')?.textContent).toBe('0');
	});

	const health = defineScale({
		name: 'Health',
		stops: [
			{ value: 'poor', label: 'Poor', mark: 'var(--app-h1)', bg: 'var(--app-h1-bg)', ink: 'var(--app-h1-ink)' },
			{ value: 'fair', label: 'Fair', mark: 'var(--app-h2)', bg: 'var(--app-h2-bg)', ink: 'var(--app-h2-ink)' },
			{ value: 'good', label: 'Good', mark: 'var(--app-h3)', bg: 'var(--app-h3-bg)', ink: 'var(--app-h3-ink)' }
		],
		unknown: { value: 'unknown', label: 'Unknown' }
	});
	const tile = (props: Record<string, unknown>) => {
		const { container, unmount } = render(Stat, { label: 'Status', scale: health, ...props });
		const el = container.querySelector('.ds-stat') as HTMLElement;
		const out = {
			value: el.querySelector('.value')?.textContent,
			badge: el.querySelector('.ds-scale')?.textContent ?? null,
			level: el.dataset.level ?? null,
			unknown: el.hasAttribute('data-unknown'),
			mark: el.style.getPropertyValue('--mark') || null,
			missing: !!el.querySelector('.ds-missing')
		};
		unmount();
		return out;
	};

	it('shows a level on a custom scale as its name, with the stop mark', () => {
		expect(tile({ level: 'good' })).toEqual({
			value: 'Good',
			badge: null,
			level: 'good',
			unknown: false,
			mark: 'var(--app-h3)',
			missing: false
		});
	});

	it('puts the level in a ScaleBadge beside a value of its own', () => {
		expect(tile({ label: 'Uptime', value: 98, unit: '%', level: 'fair' })).toMatchObject({
			value: '98',
			badge: 'Fair',
			level: 'fair',
			mark: 'var(--app-h2)'
		});
	});

	it("marks the scale's unknown stop as unknown, and shows nothing for an unset or stray level", () => {
		expect(tile({ level: 'unknown' })).toMatchObject({ value: 'Unknown', unknown: true, level: 'unknown' });
		for (const level of [null, undefined, 'excellent']) {
			expect(tile({ level }), String(level)).toEqual({
				value: '—No value',
				badge: null,
				level: null,
				unknown: false,
				mark: null,
				missing: true
			});
		}
		expect(tile({ value: 4, level: 'excellent' })).toMatchObject({ value: '4', badge: null, mark: null });
	});

	it('lets a severity win over a level', () => {
		const { container } = render(Stat, { label: 'Status', value: 2, severity: 'high', scale: health, level: 'good' });
		const el = container.querySelector('.ds-stat') as HTMLElement;
		expect(el.dataset.severity).toBe('high');
		expect(el.hasAttribute('data-level')).toBe(false);
		expect(el.textContent).toContain('High');
		expect(el.querySelector('.ds-scale[data-value="good"]')).toBeNull();
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

describe('HelpTip', () => {
	it('is a button described by its note, shown on focus and tap, hidden on Esc', async () => {
		render(HelpTip, { text: 'Applies to new records only' });
		const button = screen.getByRole('button', { name: 'More information' });
		const tip = screen.getByRole('tooltip');
		expect(button.getAttribute('aria-describedby')).toBe(tip.id);
		expect(tip.textContent).toBe('Applies to new records only');
		expect(button.hasAttribute('data-shown')).toBe(false);
		await fireEvent.focus(button);
		expect(button.hasAttribute('data-shown')).toBe(true);
		await fireEvent.keyDown(button, { key: 'Escape' });
		expect(button.hasAttribute('data-shown')).toBe(false);
		// A tap on a hidden note shows it; a second tap hides it.
		await fireEvent.pointerDown(button);
		await fireEvent.click(button);
		expect(button.hasAttribute('data-shown')).toBe(true);
		await fireEvent.pointerDown(button);
		await fireEvent.click(button);
		expect(button.hasAttribute('data-shown')).toBe(false);
	});
});
