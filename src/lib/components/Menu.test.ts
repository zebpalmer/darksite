import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import MenuHarness from '../../tests/MenuHarness.svelte';
import type { MenuEntry } from './Menu.svelte';

function setup() {
	const onEdit = vi.fn();
	const onArchive = vi.fn();
	const onDelete = vi.fn();
	const onTransfer = vi.fn();
	const items: MenuEntry[] = [
		{ id: 'edit', label: 'Edit', keycap: 'e', onselect: onEdit },
		{ id: 'archive', label: 'Archive', needsNote: true, onselect: onArchive },
		{ separator: true },
		{ group: 'Ownership' },
		{ id: 'transfer', label: 'Transfer', disabled: true, reason: 'Only an owner can transfer', onselect: onTransfer },
		{ id: 'delete', label: 'Delete', tone: 'danger', onselect: onDelete }
	];
	render(MenuHarness, { items });
	return { onEdit, onArchive, onDelete, onTransfer, trigger: screen.getByRole('button', { name: 'Actions' }) };
}

async function openMenu(trigger: HTMLElement) {
	await fireEvent.click(trigger);
	const menu = screen.getByRole('menu', { name: 'Record actions' });
	await vi.waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
	return menu;
}

const focused = () => (document.activeElement as HTMLElement).textContent?.trim() ?? '';

describe('Menu', () => {
	it('announces a menu on its trigger and opens on click with the first item focused', async () => {
		const { trigger } = setup();
		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('menu')).toBeNull();
		await openMenu(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(focused()).toContain('Edit');
	});

	it('moves with the arrow keys, wraps, jumps with Home and End, and finds by first letter', async () => {
		const { trigger } = setup();
		const menu = await openMenu(trigger);
		await fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(focused()).toContain('Archive');
		await fireEvent.keyDown(menu, { key: 'End' });
		expect(focused()).toContain('Delete');
		await fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(focused()).toContain('Edit');
		await fireEvent.keyDown(menu, { key: 'ArrowUp' });
		expect(focused()).toContain('Delete');
		await fireEvent.keyDown(menu, { key: 't' });
		expect(focused()).toContain('Transfer');
		await fireEvent.keyDown(menu, { key: 'Home' });
		expect(focused()).toContain('Edit');
	});

	it('activates an item, closes, and returns focus to the trigger', async () => {
		const { trigger, onArchive } = setup();
		const menu = await openMenu(trigger);
		await fireEvent.keyDown(menu, { key: 'ArrowDown' });
		await fireEvent.keyDown(menu, { key: 'Enter' });
		expect(onArchive).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('keeps a disabled item visible and explains it, but never runs it', async () => {
		const { trigger, onTransfer } = setup();
		const menu = await openMenu(trigger);
		const item = screen.getByRole('menuitem', { name: /Transfer/ });
		expect(item.getAttribute('aria-disabled')).toBe('true');
		expect(document.getElementById(item.getAttribute('aria-describedby')!)?.textContent).toBe(
			'Only an owner can transfer'
		);
		item.focus();
		await fireEvent.keyDown(menu, { key: 'Enter' });
		await fireEvent.click(item);
		expect(onTransfer).not.toHaveBeenCalled();
		expect(screen.getByRole('menu')).toBeTruthy();
	});

	it('closes on Escape and returns focus to the trigger', async () => {
		const { trigger } = setup();
		const menu = await openMenu(trigger);
		await fireEvent.keyDown(menu, { key: 'Escape' });
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('opens on the last item with ArrowUp from the trigger', async () => {
		const { trigger } = setup();
		trigger.focus();
		await fireEvent.keyDown(trigger, { key: 'ArrowUp' });
		await vi.waitFor(() => expect(focused()).toContain('Delete'));
	});

	it('renders groups, separators, and the note marker', async () => {
		const { trigger } = setup();
		await openMenu(trigger);
		expect(screen.getByRole('group', { name: 'Ownership' })).toBeTruthy();
		expect(screen.getAllByRole('separator').length).toBeGreaterThan(0);
		expect(screen.getByRole('menuitem', { name: /Archive.*\(asks for a note\)/ })).toBeTruthy();
	});
});
