<script lang="ts">
	import { base } from '$app/paths';
	import {
		type DifficultyKey,
		type Summary,
		formatDuration,
		scoreBand
	} from '$lib/scoring';

	let {
		packTitle,
		summary,
		onPlayAgain,
		xpEarned = 0,
		leveledUpTo = null
	}: {
		packTitle: string;
		summary: Summary;
		onPlayAgain: () => void;
		xpEarned?: number;
		leveledUpTo?: number | null;
	} = $props();

	const band = $derived(scoreBand(summary.score, summary.total));

	const HEADLINE: Record<ReturnType<typeof scoreBand>, string> = {
		great: 'Perfect round.',
		good: 'Strong showing.',
		fair: 'Not bad — run it back.',
		low: 'Rough one. The explanations are there for a reason.'
	};

	const BANDS: { key: DifficultyKey; label: string }[] = [
		{ key: 'easy', label: 'Easy' },
		{ key: 'medium', label: 'Medium' },
		{ key: 'hard', label: 'Hard' }
	];

	function pct(correct: number, total: number): number {
		return total === 0 ? 0 : Math.round((correct / total) * 100);
	}

	let heading = $state<HTMLHeadingElement | null>(null);
	$effect(() => {
		heading?.focus();
	});

	let shareLabel = $state('Share');

	async function share() {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		const text = `I scored ${summary.score}/${summary.total} on the ${packTitle} pack in Quiz Lab — try it: ${url}`;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				shareLabel = 'Copied!';
				setTimeout(() => (shareLabel = 'Share'), 1800);
				return;
			}
			throw new Error('clipboard unavailable');
		} catch {
			// Safari private mode / blocked clipboard — fall back to a selectable prompt.
			window.prompt('Copy your result:', text);
		}
	}
</script>

<section class="scorecard" data-band={band} aria-labelledby="scorecard-heading">
	<p class="eyebrow">You scored</p>
	<h1 id="scorecard-heading" class="score" tabindex="-1" bind:this={heading}>
		{summary.score}<span class="of">/ {summary.total}</span>
	</h1>
	<p class="headline">{HEADLINE[band]}</p>

	{#if xpEarned > 0}
		<p class="xp-earned">
			<span class="xp-amount">+{xpEarned} XP</span>
			{#if leveledUpTo !== null}
				<span class="levelup">⬆ Reached level {leveledUpTo}</span>
			{/if}
		</p>
	{/if}

	<dl class="meta">
		<div>
			<dt>Time</dt>
			<dd>{formatDuration(summary.totalMs)}</dd>
		</div>
		<div>
			<dt>Accuracy</dt>
			<dd>{pct(summary.score, summary.total)}%</dd>
		</div>
	</dl>

	<div class="breakdown">
		<p class="section-label">Accuracy by difficulty</p>
		{#each BANDS as { key, label } (key)}
			{@const tally = summary.byDifficulty[key]}
			<div class="bar-row" class:empty={tally.total === 0}>
				<span class="bar-label">{label}</span>
				<div class="bar-track" role="presentation">
					<div class="bar-fill" style="width: {pct(tally.correct, tally.total)}%"></div>
				</div>
				<span class="bar-value">
					{#if tally.total === 0}—{:else}{tally.correct}/{tally.total}{/if}
				</span>
			</div>
		{/each}
	</div>

	{#if summary.missed.length > 0}
		<details class="missed">
			<summary>
				Review {summary.missed.length} missed {summary.missed.length === 1
					? 'question'
					: 'questions'}
			</summary>
			<ul>
				{#each summary.missed as question (question.id)}
					<li>
						<p class="missed-prompt">{question.prompt}</p>
						<p class="missed-answer">
							<span class="tick" aria-hidden="true">✓</span>
							{question.choices[question.correctIndex]}
						</p>
						<p class="missed-explanation">{question.explanation}</p>
					</li>
				{/each}
			</ul>
		</details>
	{/if}

	<div class="actions">
		<button type="button" class="primary" onclick={onPlayAgain}>Play again</button>
		<a class="secondary" href="{base}/">Play another pack</a>
		<button type="button" class="ghost" onclick={share}>{shareLabel}</button>
	</div>
</section>

<style>
	/* Palette: black / green / white only — no red or pink. */
	.scorecard {
		--ink: #14532d; /* deep green ink */
		--green: #166534; /* primary green accent */
		--green-bright: #15803d;
		--green-tint: #f0fdf4;
		--line: #d9e6dd;

		text-align: center;
		background: #fff;
		border: 1px solid #e2e2e2;
		border-radius: 12px;
		padding: 2.5rem 2rem;
		margin-top: 1rem;
	}

	.eyebrow {
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem;
	}

	.score {
		font-size: 4rem;
		font-weight: 800;
		color: var(--green);
		margin: 0;
		line-height: 1;
		outline: none;
	}

	/* Bands deepen the green for stronger rounds; lower rounds stay near-black. */
	.scorecard[data-band='great'] .score,
	.scorecard[data-band='good'] .score {
		color: var(--green-bright);
	}

	.scorecard[data-band='low'] .score {
		color: #1a1a1a;
	}

	.score .of {
		color: var(--text-muted);
		font-weight: 400;
		font-size: 2rem;
		margin-left: 0.4rem;
	}

	.headline {
		color: #333;
		font-size: 1.05rem;
		margin: 1rem auto 0.75rem;
		max-width: 40ch;
		line-height: 1.5;
	}

	.xp-earned {
		display: inline-flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem 0.75rem;
		margin: 0 auto 1.5rem;
	}

	.xp-amount {
		background: var(--green-tint);
		color: var(--green);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.25rem 0.7rem;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.levelup {
		color: var(--green-bright);
		font-weight: 700;
		font-size: 0.9rem;
	}

	.meta {
		display: flex;
		justify-content: center;
		gap: 2.5rem;
		margin: 0 0 1.75rem;
		padding: 1rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}

	.meta div {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.meta dt {
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.meta dd {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.breakdown {
		text-align: left;
		margin-bottom: 1.75rem;
	}

	.section-label {
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.75rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 4.5rem 1fr 2.75rem;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
		font-size: 0.85rem;
	}

	.bar-label {
		color: #333;
		font-weight: 600;
	}

	.bar-track {
		height: 0.6rem;
		background: var(--green-tint);
		border: 1px solid var(--line);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--green-bright);
		border-radius: 999px;
		transition: width 400ms ease;
	}

	.bar-value {
		text-align: right;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.bar-row.empty .bar-label {
		color: var(--text-muted);
		font-weight: 500;
	}

	.missed {
		text-align: left;
		margin-bottom: 1.75rem;
		border: 1px solid var(--line);
		border-radius: 10px;
		overflow: hidden;
	}

	.missed summary {
		cursor: pointer;
		padding: 0.875rem 1rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--ink);
		background: var(--green-tint);
		list-style-position: inside;
	}

	.missed summary:focus-visible {
		outline: 2px solid var(--green);
		outline-offset: -2px;
	}

	.missed ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.missed li {
		padding: 1rem;
		border-top: 1px solid var(--line);
	}

	.missed-prompt {
		margin: 0 0 0.5rem;
		font-weight: 600;
		color: #1a1a1a;
		font-size: 0.95rem;
	}

	.missed-answer {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin: 0 0 0.5rem;
		color: var(--green);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.tick {
		color: var(--green-bright);
		font-weight: 800;
	}

	.missed-explanation {
		margin: 0;
		color: #444;
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	.primary,
	.secondary,
	.ghost {
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		font: inherit;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.primary {
		background: var(--green);
		color: #fff;
		border: none;
	}

	.primary:hover {
		background: var(--ink);
	}

	.secondary {
		background: #fff;
		color: var(--green);
		border: 1.5px solid var(--green);
	}

	.secondary:hover {
		background: var(--green-tint);
	}

	.ghost {
		background: transparent;
		color: #1a1a1a;
		border: 1.5px solid #cfcfcf;
	}

	.ghost:hover {
		border-color: #1a1a1a;
	}

	.primary:focus-visible,
	.secondary:focus-visible,
	.ghost:focus-visible {
		outline: 2px solid var(--green);
		outline-offset: 2px;
	}

	@media (max-width: 375px) {
		.actions {
			flex-direction: column;
		}

		.actions .primary,
		.actions .secondary,
		.actions .ghost {
			justify-content: center;
		}
	}
</style>
