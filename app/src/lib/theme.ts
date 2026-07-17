import { writable } from 'svelte/store';

/**
 * Client-only colour-scheme preference. Persisted in localStorage and mirrored
 * onto <html data-theme="…"> so global CSS can retune the palette in one place
 * (see the dark-theme block in routes/+layout.svelte). No backend.
 *
 * NOTE: the STORAGE_KEY below is duplicated by the no-FOUC inline script in
 * src/app.html, which applies the theme before hydration to avoid a flash of
 * the light palette. Keep the two in sync.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'quizlab.theme.v1';

export const theme = writable<Theme>('light');

/** Stored preference, else the OS setting, else light. Safe during SSR. */
export function loadTheme(): Theme {
	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw === 'light' || raw === 'dark') return raw;
		} catch {
			// Storage disabled (Safari private mode) — fall through to OS / default.
		}
	}
	if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

function saveTheme(value: Theme): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// Best-effort — preference is non-critical.
	}
}

/** Reflect the theme onto <html> so global CSS can key off it. No-op during SSR. */
export function applyTheme(value: Theme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.theme = value;
}

/** Hydrate the store from storage and paint the theme. Call once on mount (browser only). */
export function initTheme(): void {
	const value = loadTheme();
	theme.set(value);
	applyTheme(value);
}

/** Flip light↔dark, persist, and repaint. */
export function toggleTheme(): void {
	theme.update((current) => {
		const next: Theme = current === 'dark' ? 'light' : 'dark';
		saveTheme(next);
		applyTheme(next);
		return next;
	});
}
