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
});
