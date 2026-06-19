import type { Question } from './packs';
import { DIFFICULTY_KEYS, type DifficultyKey } from './packs';
export type { DifficultyKey } from './packs';

/** One player's outcome on a single question, captured as they play. */
export type AnswerRecord = {
	qId: string;
	chosen: number;
	correct: boolean;
	msToAnswer: number;
};

/** Correct-vs-total tally for one difficulty band. */
export type Tally = { correct: number; total: number };

export type Summary = {
	score: number;
	total: number;
	byDifficulty: Record<DifficultyKey, Tally>;
	totalMs: number;
	/** Questions the player got wrong, in play order, for the missed-questions review. */
	missed: Question[];
};

/**
 * Reduce a round's per-question answer records into a scorecard summary.
 * Pure — no side effects, no clock reads — so it is trivially unit-testable.
 * Answers are matched to questions by `qId`; unknown ids are ignored.
 */
export function summarize(answers: AnswerRecord[], questions: Question[]): Summary {
	const byId = new Map(questions.map((q) => [q.id, q]));

	const byDifficulty: Record<DifficultyKey, Tally> = {
		easy: { correct: 0, total: 0 },
		medium: { correct: 0, total: 0 },
		hard: { correct: 0, total: 0 }
	};

	let score = 0;
	let totalMs = 0;
	const missed: Question[] = [];

	for (const answer of answers) {
		const question = byId.get(answer.qId);
		if (!question) continue;

		totalMs += answer.msToAnswer;
		const band = byDifficulty[DIFFICULTY_KEYS[question.difficulty]];
		band.total += 1;

		if (answer.correct) {
			score += 1;
			band.correct += 1;
		} else {
			missed.push(question);
		}
	}

	return { score, total: questions.length, byDifficulty, totalMs, missed };
}

/** "1:23" / "0:04" — minutes:seconds, seconds zero-padded. */
export function formatDuration(ms: number): string {
	const totalSeconds = Math.round(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export type ScoreBand = 'great' | 'good' | 'fair' | 'low';

/** Map a score to a band used to pick the celebratory accent and headline copy. */
export function scoreBand(score: number, total: number): ScoreBand {
	if (total === 0) return 'low';
	const ratio = score / total;
	if (ratio === 1) return 'great';
	if (ratio >= 0.7) return 'good';
	if (ratio >= 0.4) return 'fair';
	return 'low';
}
