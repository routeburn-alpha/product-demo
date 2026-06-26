import { describe, expect, it } from 'vitest';
import { listPacks } from './packs';

describe('listPacks()', () => {
	const packs = listPacks();

	it('returns at least one pack', () => {
		expect(packs.length).toBeGreaterThan(0);
	});

	it('returns packs sorted alphabetically by title', () => {
		const titles = packs.map((p) => p.title);
		const sorted = [...titles].sort((a, b) => a.localeCompare(b));
		expect(titles).toEqual(sorted);
	});

	it.each(packs)('$id has the required Pack fields', (pack) => {
		expect(pack.id).toBeTruthy();
		expect(pack.title).toBeTruthy();
		expect(pack.category).toBeTruthy();
		expect(pack.description).toBeTruthy();
		expect(Array.isArray(pack.questions)).toBe(true);
	});

	it('any pack that ships a cover has a unique (coverColor, coverEmoji) combo', () => {
		const combos = packs
			.filter((p) => p.coverColor || p.coverEmoji)
			.map((p) => `${p.coverColor ?? ''}|${p.coverEmoji ?? ''}`);
		expect(new Set(combos).size).toBe(combos.length);
	});

	it('any addedAt value parses to a valid date', () => {
		for (const pack of packs) {
			if (pack.addedAt === undefined) continue;
			const t = Date.parse(pack.addedAt);
			expect(Number.isNaN(t)).toBe(false);
		}
	});

	it('cover colors use only black, green, and white hues (accessibility standard)', () => {
		const packsWithColors = packs.filter((p) => p.coverColor);
		for (const pack of packsWithColors) {
			// Red and pink hues are not allowed
			const isRed = /^#[C-F][0-3]|^#[89A-F][0-2]/.test(pack.coverColor!);
			expect(isRed, `Pack ${pack.id} has a red/pink color: ${pack.coverColor}`).toBe(false);
		}
	});

	it.each(packs.flatMap((p) => p.questions.map((q) => ({ packId: p.id, q }))))(
		'$packId/$q.id is a well-formed Question',
		({ q }) => {
			expect(q.id).toBeTruthy();
			expect(q.prompt).toBeTruthy();
			expect(q.choices).toHaveLength(4);
			expect(q.correctIndex).toBeGreaterThanOrEqual(0);
			expect(q.correctIndex).toBeLessThanOrEqual(3);
			expect(q.difficulty).toBeGreaterThanOrEqual(1);
			expect(q.difficulty).toBeLessThanOrEqual(3);
			expect(q.explanation).toBeTruthy();
		}
	);

	describe('tuscany-wine-regions pack (Idea #15)', () => {
		const twr = packs.find((p) => p.id === 'tuscany-wine-regions');

		it('exists', () => {
			expect(twr).toBeDefined();
		});

		it('has between 5 and 7 questions', () => {
			expect(twr!.questions.length).toBeGreaterThanOrEqual(5);
			expect(twr!.questions.length).toBeLessThanOrEqual(7);
		});

		it('has only difficulty 1 and 2 questions', () => {
			for (const q of twr!.questions) {
				expect(q.difficulty).toBeGreaterThanOrEqual(1);
				expect(q.difficulty).toBeLessThanOrEqual(2);
			}
		});

		it('covers at least geography, characteristics, and tourism topics', () => {
			const topics = new Set(twr!.questions.map((q) => q.id.split('-')[1]!));
			expect(topics.has('geo')).toBe(true);
			expect(topics.has('char')).toBe(true);
			expect(topics.has('tour')).toBe(true);
		});
	});

	describe('nba-trivia pack (Idea #16)', () => {
		const nba = packs.find((p) => p.id === 'nba-trivia');

		it('exists', () => {
			expect(nba).toBeDefined();
		});

		it('has between 15 and 20 questions', () => {
			expect(nba!.questions.length).toBeGreaterThanOrEqual(15);
			expect(nba!.questions.length).toBeLessThanOrEqual(20);
		});

		it('has category "Sports"', () => {
			expect(nba!.category).toBe('Sports');
		});

		it('has coverEmoji 🏀', () => {
			expect(nba!.coverEmoji).toBe('🏀');
		});

		it('has all three difficulty levels represented', () => {
			const levels = new Set(nba!.questions.map((q) => q.difficulty));
			expect(levels.has(1)).toBe(true);
			expect(levels.has(2)).toBe(true);
			expect(levels.has(3)).toBe(true);
		});

		it('has question IDs in nba-N format', () => {
			for (const q of nba!.questions) {
				expect(q.id).toMatch(/^nba-\d+$/);
			}
		});
	});

	describe('san-francisco pack (Idea #2)', () => {
		const sf = packs.find((p) => p.id === 'san-francisco');

		it('exists', () => {
			expect(sf).toBeDefined();
		});

		it('has exactly 10 questions', () => {
			expect(sf!.questions).toHaveLength(10);
		});

		it('has the planned 3/5/2 difficulty distribution (after making Haight-Ashbury harder)', () => {
			const counts = sf!.questions.reduce<Record<number, number>>((acc, q) => {
				acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
				return acc;
			}, {});
			expect(counts).toEqual({ 1: 3, 2: 5, 3: 2 });
		});

		it('has 2 questions in each of the 5 planned topics', () => {
			const topics = sf!.questions.reduce<Record<string, number>>((acc, q) => {
				const topic = q.id.split('-')[1]!;
				acc[topic] = (acc[topic] ?? 0) + 1;
				return acc;
			}, {});
			expect(topics).toEqual({ nb: 2, lm: 2, food: 2, tr: 2, hist: 2 });
		});

		it('sf-nb-1 (Haight-Ashbury question) has been made more challenging', () => {
			const sfNb1 = sf!.questions.find((q) => q.id === 'sf-nb-1');
			expect(sfNb1).toBeDefined();
			// This question should now be difficulty 2, not 1
			expect(sfNb1!.difficulty).toBe(2);
		});
	});

	describe('lord-of-the-rings pack (Task #229)', () => {
		const lotr = packs.find((p) => p.id === 'lord-of-the-rings');

		it('exists', () => {
			expect(lotr).toBeDefined();
		});

		it('has between 6 and 7 questions', () => {
			expect(lotr!.questions.length).toBeGreaterThanOrEqual(6);
			expect(lotr!.questions.length).toBeLessThanOrEqual(7);
		});

		it('has only difficulty 1 questions', () => {
			for (const q of lotr!.questions) {
				expect(q.difficulty).toBe(1);
			}
		});

		it('has question IDs in lotr-N format', () => {
			for (const q of lotr!.questions) {
				expect(q.id).toMatch(/^lotr-\d+$/);
			}
		});

		it('has all choices at most 32 characters', () => {
			for (const q of lotr!.questions) {
				for (const choice of q.choices) {
					expect(choice.length).toBeLessThanOrEqual(32);
				}
			}
		});
	});
});
