import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('README', () => {
	it('contains todays date', () => {
		const readmePath = resolve(__dirname, '../../../README.md');
		const content = readFileSync(readmePath, 'utf-8');
		
		// Get today's date in YYYY-MM-DD format
		const today = new Date().toISOString().split('T')[0];
		
		expect(content).toContain(today);
	});
});
