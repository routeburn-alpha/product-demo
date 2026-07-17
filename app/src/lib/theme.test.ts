import { afterEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { loadTheme, theme, toggleTheme } from './theme';

describe('loadTheme() / toggleTheme()', () => {
	const store = new Map<string, string>();
	// Minimal localStorage stand-in for the node test environment.
	(globalThis as unknown as { localStorage: Storage }).localStorage = {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => void store.set(k, v),
		removeItem: (k: string) => void store.delete(k),
		clear: () => store.clear(),
		key: () => null,
		length: 0
	} as Storage;

	afterEach(() => {
		store.clear();
		theme.set('light');
	});

	it('reads a stored preference', () => {
		store.set('quizlab.theme.v1', 'dark');
		expect(loadTheme()).toBe('dark');
	});

	// With no stored value and no matchMedia (node), it falls back to light.
	it('defaults to light when nothing is stored', () => {
		expect(loadTheme()).toBe('light');
	});

	it('ignores an unrecognised stored value', () => {
		store.set('quizlab.theme.v1', 'sepia');
		expect(loadTheme()).toBe('light');
	});

	it('toggles the store and persists the new preference', () => {
		expect(get(theme)).toBe('light');
		toggleTheme();
		expect(get(theme)).toBe('dark');
		expect(store.get('quizlab.theme.v1')).toBe('dark');
		expect(loadTheme()).toBe('dark');

		toggleTheme();
		expect(get(theme)).toBe('light');
		expect(store.get('quizlab.theme.v1')).toBe('light');
	});
});
