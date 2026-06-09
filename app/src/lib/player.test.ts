import { afterEach, describe, expect, it } from 'vitest';
import {
	awardForAnswer,
	defaultPlayer,
	levelFor,
	loadPlayer,
	recordPlay,
	savePlayer,
	xpForAnswer,
	type PlayerState
} from './player';

describe('levelFor()', () => {
	it('uses floor(xp / 100) and reports xp to next level', () => {
		expect(levelFor(0)).toEqual({ level: 0, xpToNext: 100 });
		expect(levelFor(99)).toEqual({ level: 0, xpToNext: 1 });
		expect(levelFor(100)).toEqual({ level: 1, xpToNext: 100 });
		// Matches the design's "Lv 3 · 320 XP" example.
		expect(levelFor(320)).toEqual({ level: 3, xpToNext: 80 });
	});
});

describe('xpForAnswer()', () => {
	it('scales by difficulty and gives nothing for wrong answers', () => {
		expect(xpForAnswer(true, 1)).toBe(10);
		expect(xpForAnswer(true, 2)).toBe(15);
		expect(xpForAnswer(true, 3)).toBe(20);
		expect(xpForAnswer(false, 3)).toBe(0);
	});
});

describe('awardForAnswer()', () => {
	it('adds difficulty-scaled XP and recomputes level', () => {
		const s = awardForAnswer(defaultPlayer(), true, 3);
		expect(s.xp).toBe(20);
		expect(s.level).toBe(0);
	});

	it('leaves state untouched on a wrong answer', () => {
		const base = defaultPlayer();
		expect(awardForAnswer(base, false, 2)).toBe(base);
	});

	it('crosses a level boundary', () => {
		let s: PlayerState = { ...defaultPlayer(), xp: 90, level: 0 };
		s = awardForAnswer(s, true, 2); // +15 → 105
		expect(s.xp).toBe(105);
		expect(s.level).toBe(1);
	});
});

describe('recordPlay()', () => {
	it('starts the streak at 1 on the first ever play and adds the completion bonus', () => {
		const s = recordPlay(defaultPlayer(), 'ski-slopes', '2026-06-09');
		expect(s.xp).toBe(25);
		expect(s.streakDays).toBe(1);
		expect(s.lastPlayedDate).toBe('2026-06-09');
		expect(s.packsCompleted).toEqual(['ski-slopes']);
	});

	it('increments the streak and pays the +50 bonus on a consecutive day', () => {
		const day1 = recordPlay(defaultPlayer(), 'a', '2026-06-09');
		const day2 = recordPlay(day1, 'b', '2026-06-10');
		expect(day2.streakDays).toBe(2);
		// +25 completion +50 streak bonus on top of day1's 25.
		expect(day2.xp).toBe(25 + 75);
		expect(day2.packsCompleted).toEqual(['a', 'b']);
	});

	it('is idempotent for same-day replays (no streak bump, no duplicate pack)', () => {
		const first = recordPlay(defaultPlayer(), 'a', '2026-06-09');
		const again = recordPlay(first, 'a', '2026-06-09');
		expect(again.streakDays).toBe(1);
		expect(again.packsCompleted).toEqual(['a']);
		expect(again.xp).toBe(first.xp + 25); // completion bonus still applies, no streak bonus
	});

	it('resets the streak to 1 after a missed day', () => {
		const day1 = recordPlay(defaultPlayer(), 'a', '2026-06-09');
		const day2 = recordPlay(day1, 'b', '2026-06-10');
		expect(day2.streakDays).toBe(2);
		const afterGap = recordPlay(day2, 'c', '2026-06-13'); // skipped the 11th & 12th
		expect(afterGap.streakDays).toBe(1);
		expect(afterGap.xp).toBe(day2.xp + 25); // completion only, no streak bonus
	});
});

describe('loadPlayer() / savePlayer()', () => {
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

	afterEach(() => store.clear());

	it('round-trips state through storage', () => {
		const s: PlayerState = { xp: 320, level: 3, streakDays: 2, lastPlayedDate: '2026-06-09', packsCompleted: ['a'] };
		savePlayer(s);
		expect(loadPlayer()).toEqual(s);
	});

	it('returns a default player when nothing is stored', () => {
		expect(loadPlayer()).toEqual(defaultPlayer());
	});

	it('falls back to a default player on corrupt JSON', () => {
		store.set('quizlab.player.v1', '{not json');
		expect(loadPlayer()).toEqual(defaultPlayer());
	});

	it('backfills missing fields from defaults', () => {
		store.set('quizlab.player.v1', JSON.stringify({ xp: 50 }));
		expect(loadPlayer()).toEqual({ ...defaultPlayer(), xp: 50 });
	});
});
