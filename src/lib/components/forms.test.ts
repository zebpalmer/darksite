import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Avatar from './Avatar.svelte';
import Card from './Card.svelte';
import Combobox from './Combobox.svelte';
import Dialog from './Dialog.svelte';
import SegmentedControl from './SegmentedControl.svelte';
import SeverityPicker from './SeverityPicker.svelte';
import Tabs from './Tabs.svelte';
import FieldHarness from '../../tests/FieldHarness.svelte';
import FormButtonHarness from '../../tests/FormButtonHarness.svelte';
import NoteDialogHarness from '../../tests/NoteDialogHarness.svelte';
import PopoverHarness from '../../tests/PopoverHarness.svelte';

describe('Field', () => {
	it('labels the control and describes it with help', () => {
		render(FieldHarness, { help: 'Who answers for it' });
		const input = screen.getByLabelText(/Owner/);
		const note = document.getElementById(input.getAttribute('aria-describedby')!.split(' ')[0]);
		expect(note?.textContent).toBe('Who answers for it');
		expect(input.getAttribute('aria-invalid')).toBeNull();
	});

	it('replaces help with the error and marks the control invalid', () => {
		render(FieldHarness, { help: 'Who answers for it', error: 'Pick an owner', tip: 'One person' });
		const input = screen.getByRole('textbox');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		const ids = input.getAttribute('aria-describedby')!.split(' ');
		expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual(['Pick an owner', 'One person']);
		expect(document.body.textContent).not.toContain('Who answers for it');
	});
});

describe('SegmentedControl', () => {
	const options = [
		{ value: 's', label: 'Small' },
		{ value: 'm', label: 'Medium' },
		{ value: 'l', label: 'Large', disabled: true }
	];

	it('is a radio group with one tab stop, and arrows select', async () => {
		const onchange = vi.fn();
		render(SegmentedControl, { options, value: 's', label: 'Density', onchange });
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
		await fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith('m');
		// The disabled option is skipped: Right wraps to the first.
		await fireEvent.keyDown(radios[1], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith('s');
	});
});

describe('SegmentedControl with boolean and null values', () => {
	it('selects true, null and false as values, for a tri-state filter', async () => {
		const onchange = vi.fn();
		render(SegmentedControl, {
			label: 'Flagged',
			value: null,
			onchange,
			options: [
				{ value: true, label: 'Include' },
				{ value: null, label: "Don't care" },
				{ value: false, label: 'Exclude' }
			]
		});
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
		expect(radios[1].tabIndex).toBe(0);
		await fireEvent.keyDown(radios[1], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenLastCalledWith(false);
		await fireEvent.click(radios[0]);
		expect(onchange).toHaveBeenLastCalledWith(true);
		await fireEvent.click(radios[1]);
		expect(onchange).toHaveBeenLastCalledWith(null);
		expect(radios[1].getAttribute('aria-checked')).toBe('true');
	});
});

describe('Field tip', () => {
	it('names its tip button after the label, or by tipLabel', async () => {
		const { unmount } = render(FieldHarness, { tip: 'One person' });
		expect(screen.getByRole('button', { name: 'About Owner' })).toBeTruthy();
		unmount();
		render(FieldHarness, { tip: 'One person', tipLabel: 'Who owns it' });
		expect(screen.getByRole('button', { name: 'Who owns it' })).toBeTruthy();
	});
});

describe('Labeling a group with a Field', () => {
	it("names the radio group by the Field's label and describes it with the help", () => {
		render(FormButtonHarness);
		const group = screen.getByRole('radiogroup', { name: 'View' });
		expect(group.getAttribute('aria-label')).toBeNull();
		const note = document.getElementById(group.getAttribute('aria-describedby')!);
		expect(note?.textContent).toBe('How the queue is shown');
	});
});

describe('Button form attributes', () => {
	it('submits a form elsewhere in the page through the form attribute', async () => {
		const onsubmit = vi.fn();
		render(FormButtonHarness, { onsubmit });
		const save = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
		expect(save.getAttribute('form')).toBe('edit-record');
		expect(save.form?.id).toBe('edit-record');
		await fireEvent.click(save);
		expect(onsubmit).toHaveBeenCalledTimes(1);
		expect((onsubmit.mock.calls[0][0] as FormData).get('title')).toBe('Alpha');
	});
});

describe('Tabs', () => {
	it('is a tablist without hrefs', async () => {
		const onchange = vi.fn();
		render(Tabs, {
			tabs: [
				{ value: 'queue', label: 'Queue', count: 12 },
				{ value: 'failed', label: 'Failed', count: 3, tone: 'danger' }
			],
			value: 'queue',
			label: 'Lanes',
			idPrefix: 'lanes',
			onchange
		});
		const tabs = screen.getAllByRole('tab');
		expect(tabs[0].getAttribute('aria-controls')).toBe('lanes-panel-queue');
		await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenCalledWith('failed');
	});

	it('gives two tab sets without an idPrefix distinct ids', () => {
		const tabs = [
			{ value: 'a', label: 'One' },
			{ value: 'b', label: 'Two' }
		];
		render(Tabs, { tabs, value: 'a', label: 'First' });
		render(Tabs, { tabs, value: 'a', label: 'Second' });
		const ids = screen.getAllByRole('tab').map((t) => t.id);
		expect(ids).toHaveLength(4);
		expect(new Set(ids).size).toBe(4);
		expect(new Set(screen.getAllByRole('tab').map((t) => t.getAttribute('aria-controls'))).size).toBe(4);
	});

	it('is a nav of links with hrefs', () => {
		render(Tabs, {
			tabs: [
				{ value: 'a', label: 'Open', href: '/open' },
				{ value: 'b', label: 'Closed', href: '/closed' }
			],
			value: 'b',
			label: 'Views'
		});
		expect(screen.getByRole('navigation', { name: 'Views' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Closed' }).getAttribute('aria-current')).toBe('page');
	});
});

describe('SeverityPicker', () => {
	it('hides stops above max and selects with arrows', async () => {
		const onchange = vi.fn();
		render(SeverityPicker, { value: null, max: 'high', onchange });
		const radios = screen.getAllByRole('radio');
		expect(radios.map((r) => r.textContent?.trim())).toEqual(['Info', 'Low', 'Medium', 'High']);
		await fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
		expect(onchange).toHaveBeenCalledWith('low');
	});
});

describe('Combobox', () => {
	const items = [
		{ value: '1', label: 'North wing' },
		{ value: '2', label: 'South wing', meta: '4' },
		{ value: '3', label: 'Annex' }
	];

	it('filters, moves with arrows and picks with Enter', async () => {
		const onselect = vi.fn();
		render(Combobox, { items, label: 'Site', onselect });
		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'wing' } });
		expect(screen.getAllByRole('option')).toHaveLength(2);
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1].id);
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onselect).toHaveBeenCalledWith(items[1]);
		expect((input as HTMLInputElement).value).toBe('');
	});

	it('creates with shift+Enter, as the last row', async () => {
		const oncreate = vi.fn();
		render(Combobox, { items, label: 'Site', oncreate });
		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'wing' } });
		const options = screen.getAllByRole('option');
		expect(options.at(-1)?.textContent).toContain('Create "wing"');
		await fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
		expect(oncreate).toHaveBeenCalledWith('wing');
	});

	it('swallows Esc only while open', async () => {
		render(Combobox, { items, label: 'Site' });
		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'a' } });
		const open = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		input.dispatchEvent(open);
		expect(open.defaultPrevented).toBe(true);
		const closed = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		input.dispatchEvent(closed);
		expect(closed.defaultPrevented).toBe(false);
	});
});

describe('Dialog', () => {
	it('mounts only while open and confirms', async () => {
		const onconfirm = vi.fn();
		const { rerender } = render(Dialog, { open: false, title: 'Delete 3 records?', onconfirm });
		expect(screen.queryByRole('alertdialog')).toBeNull();
		await rerender({ open: true, title: 'Delete 3 records?', onconfirm });
		const dialog = screen.getByRole('alertdialog');
		expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onconfirm).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('alertdialog')).toBeNull();
	});

	it('stays open and shows the error when an async confirm fails', async () => {
		const onconfirm = () => Promise.reject(new Error('Could not delete'));
		render(Dialog, { open: true, title: 'Delete?', onconfirm, confirmingLabel: 'Deleting' });
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not delete'));
		expect(screen.getByRole('alertdialog')).toBeTruthy();
	});
});

describe('Dialog hero', () => {
	it('is a default-tone dialog with a primary confirm and a hidden grab handle', async () => {
		const onconfirm = vi.fn();
		render(Dialog, {
			open: true,
			size: 'hero',
			title: 'Welcome aboard',
			description: 'Make an account to keep your place.',
			confirmLabel: 'Get started',
			cancelLabel: 'Not now',
			onconfirm
		});
		const dialog = screen.getByRole('dialog', { name: 'Welcome aboard' });
		expect(dialog.dataset.size).toBe('hero');
		expect(dialog.querySelector('.grab')?.getAttribute('aria-hidden')).toBe('true');
		const confirm = screen.getByRole('button', { name: 'Get started' });
		expect(confirm.dataset.variant).toBe('primary');
		await fireEvent.click(confirm);
		expect(onconfirm).toHaveBeenCalledTimes(1);
	});

	it('keeps an explicit danger tone, and no grab handle on the other sizes', () => {
		render(Dialog, { open: true, size: 'hero', tone: 'danger', title: 'Leave the beta?' });
		expect(screen.getByRole('alertdialog').querySelector('.grab')).toBeTruthy();
		document.body.innerHTML = '';
		render(Dialog, { open: true, title: 'Delete?' });
		expect(screen.getByRole('alertdialog').querySelector('.grab')).toBeNull();
	});
});

describe('Dialog scrim', () => {
	it('closes on a press that starts and ends on the scrim, not on a drag out of the panel', async () => {
		const oncancel = vi.fn();
		render(Dialog, { open: true, title: 'Discard this draft?', oncancel });
		const dialog = screen.getByRole('alertdialog');
		const title = screen.getByRole('heading', { name: 'Discard this draft?' });
		// A selection dragged from the title out onto the scrim: the click lands on the dialog.
		await fireEvent.pointerDown(title);
		await fireEvent.click(dialog);
		expect(oncancel).not.toHaveBeenCalled();
		await fireEvent.pointerDown(dialog);
		await fireEvent.click(dialog);
		expect(oncancel).toHaveBeenCalledTimes(1);
	});
});

describe('Dialog with a note', () => {
	it('starts in the field and waits for the note', async () => {
		const onconfirm = vi.fn();
		render(NoteDialogHarness, { onconfirm });
		const note = screen.getByLabelText(/Note/) as HTMLInputElement;
		await vi.waitFor(() => expect(document.activeElement).toBe(note));
		const archive = screen.getByRole('button', { name: 'Archive' }) as HTMLButtonElement;
		expect(archive.disabled).toBe(true);
		expect(archive.type).toBe('submit');
		await fireEvent.input(note, { target: { value: 'Duplicate of R-00411' } });
		expect(archive.disabled).toBe(false);
	});

	it('confirms when its form is submitted, as Enter in the field does', async () => {
		const onconfirm = vi.fn();
		render(NoteDialogHarness, { onconfirm });
		const note = screen.getByLabelText(/Note/) as HTMLInputElement;
		await fireEvent.input(note, { target: { value: 'Duplicate' } });
		await fireEvent.submit(note.form!);
		expect(onconfirm).toHaveBeenCalledWith('Duplicate');
		expect(screen.queryByRole('alertdialog')).toBeNull();
	});

	it('does not submit from Cancel', async () => {
		const onconfirm = vi.fn();
		render(NoteDialogHarness, { onconfirm });
		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onconfirm).not.toHaveBeenCalled();
	});
});

describe('Dialog closing', () => {
	it('accepts an onconfirm that returns a value', async () => {
		const onconfirm = vi.fn((): boolean => true);
		render(Dialog, { open: true, title: 'Apply?', onconfirm });
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onconfirm).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('alertdialog')).toBeNull();
	});

	it('lets onbeforeclose keep it open on Cancel and Esc', async () => {
		const onbeforeclose = vi.fn(() => false);
		const oncancel = vi.fn();
		render(Dialog, { open: true, title: 'Discard?', dirty: true, onbeforeclose, oncancel });
		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		const dialog = screen.getByRole('alertdialog');
		dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
		expect(onbeforeclose).toHaveBeenCalledTimes(2);
		expect(oncancel).not.toHaveBeenCalled();
		expect(screen.getByRole('alertdialog')).toBeTruthy();
	});

	it('follows the browser when it closes anyway', async () => {
		const onbeforeclose = vi.fn(() => false);
		render(Dialog, { open: true, title: 'Discard?', onbeforeclose });
		screen.getByRole('alertdialog').dispatchEvent(new Event('cancel', { cancelable: false }));
		await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
	});
});

describe('Popover', () => {
	it('opens from its trigger, is non-modal, and closes on Esc', async () => {
		render(PopoverHarness);
		const trigger = screen.getByRole('button', { name: 'Shortcuts' });
		await fireEvent.click(trigger);
		const panel = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
		expect(panel.getAttribute('aria-modal')).toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});

describe('Avatar', () => {
	it('falls back to initials when the image fails', async () => {
		render(Avatar, { name: 'Ada Lovelace', src: '/missing.png' });
		await fireEvent.error(screen.getByRole('img'));
		expect(screen.getByRole('img', { name: 'Ada Lovelace' }).textContent).toBe('AL');
	});
});

describe('Card', () => {
	it('passes role, ARIA and handlers to its link, for a select mode', async () => {
		const onclick = vi.fn((e: MouseEvent) => e.preventDefault());
		const onkeydown = vi.fn();
		render(Card, {
			href: '/v/1',
			title: 'Site walkthrough',
			role: 'checkbox',
			'aria-checked': true,
			'data-id': 'v1',
			onclick,
			onkeydown
		});
		const box = screen.getByRole('checkbox', { name: /Site walkthrough/ });
		expect(box.tagName).toBe('A');
		expect(box.getAttribute('aria-checked')).toBe('true');
		expect(box.dataset.id).toBe('v1');
		await fireEvent.click(box);
		await fireEvent.keyDown(box, { key: ' ' });
		expect(onclick).toHaveBeenCalledOnce();
		expect(onkeydown).toHaveBeenCalledOnce();
	});

	it('shows the duration as a clock and the rating as text', () => {
		render(Card, { href: '/v/1', title: 'Site walkthrough', duration: 3725, rating: 4 });
		const link = screen.getByRole('link');
		expect(link.textContent).toContain('1:02:05');
		expect(link.textContent).toContain('rated 4 of 5');
	});
});
