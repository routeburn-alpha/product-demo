import { writable } from 'svelte/store';
import type { Question } from './packs';

/** Persistent, client-only player progression. No backend — lives in localStorage. */
export type PlayerState = {
	xp: number;
	level: number;
	streakDays: number;
	/** ISO yyyy-mm-dd of the last completed play, or null if never played. */
	lastPlayedDate: string | null;
	/** Pack ids the player has completed at least once. */
	packsCompleted: string[];
};

// --- Tunable rules (single source of truth) ---
const XP_PER_LEVEL = 100;
const XP_PER_CORRECT = 10;
const DIFFICULTY_MULTIPLIER: Record<Question['difficulty'], number> = { 1: 1, 2: 1.5, 3: 2 };
const COMPLETION_BONUS = 25;
const STREAK_BONUS = 50;

const STORAGE_KEY = 'quizlab.player.v1';

export function defaultPlayer(): PlayerState {
	return { xp: 0, level: 0, streakDays: 0, lastPlayedDate: null, packsCompleted: [] };
}

/** Level and XP-to-next-level for a given XP total. level = floor(xp / 100). */
export function levelFor(xp: number): { level: number; xpToNext: number } {
	const level = Math.floor(xp / XP_PER_LEVEL);
	return { level, xpToNext: (level + 1) * XP_PER_LEVEL - xp };
}

/** XP earned for a single answer, before it's added to a player. */
export function xpForAnswer(correct: boolean, difficulty: Question['difficulty']): number {
	return correct ? Math.round(XP_PER_CORRECT * DIFFICULTY_MULTIPLIER[difficulty]) : 0;
}

/** Pure: award answer XP and recompute level. Wrong answers leave state unchanged. */
export function awardForAnswer(
	state: PlayerState,
	correct: boolean,
	difficulty: Question['difficulty']
): PlayerState {
	const gained = xpForAnswer(correct, difficulty);
	if (gained === 0) return state;
	const xp = state.xp + gained;
	return { ...state, xp, level: levelFor(xp).level };
}

/** Whole days from ISO yyyy-mm-dd `a` to `b` (b − a), via UTC midnight. */
function dayGap(a: string, b: string): number {
	const da = Date.parse(`${a}T00:00:00Z`);
	const db = Date.parse(`${b}T00:00:00Z`);
	return Math.round((db - da) / 86_400_000);
}

/**
 * Pure: record a completed play on `date` (ISO yyyy-mm-dd).
 * Adds the completion bonus, updates the consecutive-day streak (idempotent on
 * same-day replays, reset after a missed day), and applies the day-2+ streak bonus.
 */
export function recordPlay(state: PlayerState, packId: string, date: string): PlayerState {
	let xp = state.xp + COMPLETION_BONUS;
	let streakDays = state.streakDays;

	if (state.lastPlayedDate === null) {
		streakDays = 1;
	} else {
		const gap = dayGap(state.lastPlayedDate, date);
		if (gap === 1) {
			streakDays = state.streakDays + 1;
			if (streakDays >= 2) xp += STREAK_BONUS;
		} else if (gap > 1) {
			streakDays = 1; // missed at least a day — streak resets
		}
		// gap <= 0 (same day or stale): streak unchanged, idempotent
	}

	const packsCompleted = state.packsCompleted.includes(packId)
		? state.packsCompleted
		: [...state.packsCompleted, packId];

	return { ...state, xp, level: levelFor(xp).level, streakDays, lastPlayedDate: date, packsCompleted };
}

// --- localStorage persistence (no-ops during SSR / prerender) ---

export function loadPlayer(): PlayerState {
	if (typeof localStorage === 'undefined') return defaultPlayer();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultPlayer();
		// Merge over defaults so missing/extra fields from older versions stay safe.
		return { ...defaultPlayer(), ...(JSON.parse(raw) as Partial<PlayerState>) };
	} catch {
		return defaultPlayer();
	}
}

export function savePlayer(state: PlayerState): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Storage full or disabled (Safari private mode) — progression is best-effort.
	}
}

// --- Reactive store shared by the nav badge and the play screen ---

export const player = writable<PlayerState>(defaultPlayer());

/** Hydrate the store from localStorage. Call once on mount (browser only). */
export function initPlayer(): void {
	player.set(loadPlayer());
}

export function applyAnswer(correct: boolean, difficulty: Question['difficulty']): void {
	player.update((s) => {
		const next = awardForAnswer(s, correct, difficulty);
		savePlayer(next);
		return next;
	});
}

export function applyCompletion(packId: string, date: string): void {
	player.update((s) => {
		const next = recordPlay(s, packId, date);
		savePlayer(next);
		return next;
	});
}

/** Today as ISO yyyy-mm-dd in the player's local timezone. */
export function todayISO(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
