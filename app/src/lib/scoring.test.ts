import { describe, expect, it } from 'vitest';
import type { Question } from './packs';
import { type AnswerRecord, formatDuration, scoreBand, summarize } from './scoring';

function q(id: string, difficulty: Question['difficulty'], correctIndex: Question['correctIndex'] = 0): Question {
	return {
		id,
		prompt: `prompt ${id}`,
		choices: ['a', 'b', 'c', 'd'],
		correctIndex,
		difficulty,
		explanation: `explanation ${id}`
	};
}

function answer(qId: string, correct: boolean, msToAnswer = 1000): AnswerRecord {
	return { qId, chosen: correct ? 0 : 1, correct, msToAnswer };
}

describe('summarize()', () => {
	const questions = [q('e1', 1), q('e2', 1), q('m1', 2), q('h1', 3)];

	it('counts a perfect round and leaves nothing missed', () => {
		const answers = questions.map((question) => answer(question.id, true));
		const s = summarize(answers, questions);
		expect(s.score).toBe(4);
		expect(s.total).toBe(4);
		expect(s.missed).toEqual([]);
		expect(s.byDifficulty.easy).toEqual({ correct: 2, total: 2 });
		expect(s.byDifficulty.medium).toEqual({ correct: 1, total: 1 });
		expect(s.byDifficulty.hard).toEqual({ correct: 1, total: 1 });
	});

	it('counts an all-wrong round and lists every question as missed in play order', () => {
		const answers = questions.map((question) => answer(question.id, false));
		const s = summarize(answers, questions);
		expect(s.score).toBe(0);
		expect(s.missed.map((m) => m.id)).toEqual(['e1', 'e2', 'm1', 'h1']);
		expect(s.byDifficulty.easy).toEqual({ correct: 0, total: 2 });
		expect(s.byDifficulty.hard).toEqual({ correct: 0, total: 1 });
	});

	it('tallies a mixed round per difficulty band', () => {
		const answers = [
			answer('e1', true),
			answer('e2', false),
			answer('m1', true),
			answer('h1', false)
		];
		const s = summarize(answers, questions);
		expect(s.score).toBe(2);
		expect(s.byDifficulty.easy).toEqual({ correct: 1, total: 2 });
		expect(s.byDifficulty.medium).toEqual({ correct: 1, total: 1 });
		expect(s.byDifficulty.hard).toEqual({ correct: 0, total: 1 });
		expect(s.missed.map((m) => m.id)).toEqual(['e2', 'h1']);
	});

	it('sums answer times into totalMs', () => {
		const answers = [answer('e1', true, 1500), answer('e2', true, 2500)];
		expect(summarize(answers, questions.slice(0, 2)).totalMs).toBe(4000);
	});

	it('handles an empty round without dividing by zero', () => {
		const s = summarize([], []);
		expect(s).toEqual({
			score: 0,
			total: 0,
			byDifficulty: {
				easy: { correct: 0, total: 0 },
				medium: { correct: 0, total: 0 },
				hard: { correct: 0, total: 0 }
			},
			totalMs: 0,
			missed: []
		});
	});

	it('ignores answer records whose qId is not in the pack', () => {
		const s = summarize([answer('ghost', true), answer('e1', true)], questions);
		expect(s.score).toBe(1);
		expect(s.byDifficulty.easy).toEqual({ correct: 1, total: 1 });
	});
});

describe('scoreBand()', () => {
	it('bands by ratio and treats an empty round as low', () => {
		expect(scoreBand(10, 10)).toBe('great');
		expect(scoreBand(7, 10)).toBe('good');
		expect(scoreBand(4, 10)).toBe('fair');
		expect(scoreBand(3, 10)).toBe('low');
		expect(scoreBand(0, 0)).toBe('low');
	});
});

describe('formatDuration()', () => {
	it('formats ms as minutes:seconds with padded seconds', () => {
		expect(formatDuration(4000)).toBe('0:04');
		expect(formatDuration(83000)).toBe('1:23');
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(600)).toBe('0:01');
	});
});
