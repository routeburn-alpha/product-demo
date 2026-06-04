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

	describe('san-francisco pack (Idea #2)', () => {
		const sf = packs.find((p) => p.id === 'san-francisco');

		it('exists', () => {
			expect(sf).toBeDefined();
		});

		it('has exactly 10 questions', () => {
			expect(sf!.questions).toHaveLength(10);
		});

		it('has the planned 4/4/2 difficulty distribution', () => {
			const counts = sf!.questions.reduce<Record<number, number>>((acc, q) => {
				acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
				return acc;
			}, {});
			expect(counts).toEqual({ 1: 4, 2: 4, 3: 2 });
		});

		it('has 2 questions in each of the 5 planned topics', () => {
			const topics = sf!.questions.reduce<Record<string, number>>((acc, q) => {
				const topic = q.id.split('-')[1]!;
				acc[topic] = (acc[topic] ?? 0) + 1;
				return acc;
			}, {});
			expect(topics).toEqual({ nb: 2, lm: 2, food: 2, tr: 2, hist: 2 });
		});
	});

	describe('cuisines pack (Idea #3)', () => {
		const cuisines = packs.find((p) => p.id === 'cuisines');

		it('exists', () => {
			expect(cuisines).toBeDefined();
		});

		it('has exactly 4 questions', () => {
			expect(cuisines!.questions).toHaveLength(4);
		});

		it('has the planned 2/1/1 (easy/medium/hard) difficulty distribution', () => {
			const counts = cuisines!.questions.reduce<Record<number, number>>((acc, q) => {
				acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
				return acc;
			}, {});
			expect(counts).toEqual({ 1: 2, 2: 1, 3: 1 });
		});

		it('covers Italian, Japanese, Mexican, and Thai cuisines', () => {
			const covered = cuisines!.questions.map((q) => q.id.split('-')[1]);
			expect(new Set(covered)).toEqual(new Set(['italian', 'japanese', 'mexican', 'thai']));
		});
	});
});
