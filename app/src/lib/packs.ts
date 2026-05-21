import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

export type Question = {
	id: string;
	prompt: string;
	choices: [string, string, string, string];
	correctIndex: 0 | 1 | 2 | 3;
	difficulty: 1 | 2 | 3;
	explanation: string;
};

export type Pack = {
	id: string;
	title: string;
	category: string;
	description: string;
	coverColor?: string;
	coverEmoji?: string;
	tags?: string[];
	addedAt?: string;
	questions: Question[];
};

const PACKS_DIR = resolve('src/lib/data/packs');

export function listPacks(): Pack[] {
	return readdirSync(PACKS_DIR)
		.filter((f: string) => f.endsWith('.json'))
		.map((f: string) => JSON.parse(readFileSync(resolve(PACKS_DIR, f), 'utf-8')) as Pack)
		.sort((a: Pack, b: Pack) => a.title.localeCompare(b.title));
}

export function getPack(id: string): Pack | null {
	const file = resolve(PACKS_DIR, `${id}.json`);
	try {
		return JSON.parse(readFileSync(file, 'utf-8')) as Pack;
	} catch {
		return null;
	}
}
