<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';
	import Scorecard from '$lib/components/Scorecard.svelte';
	import { type AnswerRecord, summarize } from '$lib/scoring';
	import { applyAnswer, applyCompletion, initPlayer, levelFor, player, todayISO } from '$lib/player';

	let { data } = $props();
	const pack = $derived<Pack>(data.pack);

	let index = $state(0);
	let selected = $state<number | null>(null);
	let answers = $state<AnswerRecord[]>([]);
	let finished = $state(false);

	// Per-question timing: clock starts when a question is shown, stops when answered.
	let questionStart = now();
	let lastMs = 0;

	// XP baseline captured at the start of the round, so the scorecard can show
	// this round's gains and any level-up.
	let startXp = $state(0);
	let startLevel = $state(0);

	onMount(() => {
		initPlayer();
		resetProgressBaseline();
	});

	const question = $derived(pack.questions[index]);
	const isCorrect = $derived(selected !== null && selected === question.correctIndex);
	const summary = $derived(summarize(answers, pack.questions));
	const xpEarned = $derived($player.xp - startXp);
	const leveledUpTo = $derived(
		levelFor($player.xp).level > startLevel ? levelFor($player.xp).level : null
	);

	function now(): number {
		return typeof performance !== 'undefined' ? performance.now() : 0;
	}

	function resetProgressBaseline() {
		startXp = $player.xp;
		startLevel = levelFor($player.xp).level;
	}

	function choose(i: number) {
		if (selected !== null) return;
		selected = i;
		lastMs = now() - questionStart;
	}

	function next() {
		if (selected === null) return;
		const correct = selected === question.correctIndex;
		answers = [...answers, { qId: question.id, chosen: selected, correct, msToAnswer: lastMs }];
		applyAnswer(correct, question.difficulty);
		if (index + 1 >= pack.questions.length) {
			applyCompletion(pack.id, todayISO());
			finished = true;
		} else {
			index = index + 1;
			selected = null;
			questionStart = now();
		}
	}

	function restart() {
		index = 0;
		selected = null;
		answers = [];
		finished = false;
		questionStart = now();
		resetProgressBaseline();
	}
</script>

<div class="container">
	{#if pack.questions.length === 0}
		<div class="progress-row">
			<a class="back" href="{base}/">← All packs</a>
		</div>
		<div class="result-card">
			<p class="result-label">Coming soon</p>
			<p class="result-summary">
				This pack is being assembled. Check back once its questions land.
			</p>
			<div class="result-actions">
				<a class="secondary" href="{base}/">Pick another pack</a>
			</div>
		</div>
	{:else if !finished}
		<div class="progress-row">
			<a class="back" href="{base}/">← All packs</a>
			<span class="progress">Question {index + 1} of {pack.questions.length}</span>
		</div>

		<h1 class="pack-title">{pack.title}</h1>

		<div class="question-card">
			<p class="prompt">{question.prompt}</p>

			<div class="choices">
				{#each question.choices as choice, i (i)}
					{@const showCorrect = selected !== null && i === question.correctIndex}
					{@const showWrong = selected === i && i !== question.correctIndex}
					<button
						type="button"
						class="choice"
						class:selected={selected === i}
						class:correct={showCorrect}
						class:wrong={showWrong}
						disabled={selected !== null}
						onclick={() => choose(i)}
					>
						<span class="letter">{String.fromCharCode(65 + i)}</span>
						<span class="choice-text">{choice}</span>
					</button>
				{/each}
			</div>

			{#if selected !== null}
				<div class="explanation" class:correct={isCorrect} class:wrong={!isCorrect}>
					<strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong>
					{question.explanation}
				</div>
				<button type="button" class="next" onclick={next}>
					{index + 1 >= pack.questions.length ? 'See your results' : 'Next question →'}
				</button>
			{/if}
		</div>
	{:else}
		<div class="progress-row">
			<a class="back" href="{base}/">← All packs</a>
		</div>
		<Scorecard packTitle={pack.title} {summary} {xpEarned} {leveledUpTo} onPlayAgain={restart} />
	{/if}
</div>

<style>
	.container {
		max-width: 640px;
		margin: 0 auto;
		padding: 1rem 1.5rem 3rem;
		font-family: Calibri, sans-serif;
	}

	.progress-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		font-size: 0.85rem;
	}

	.back {
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 500;
	}

	.back:hover {
		text-decoration: underline;
	}

	.progress {
		color: var(--text-muted);
	}

	.pack-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-muted);
		margin: 0 0 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.question-card {
		background: var(--quiz-primary);
		border: 1px solid #e2e2e2;
		border-radius: 12px;
		padding: 1.75rem;
	}

	.prompt {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--quiz-on-primary);
		margin: 0 0 1.5rem;
		line-height: 1.4;
	}

	.choices {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		text-align: left;
		padding: 0.875rem 1rem;
		border: 1.5px solid #e2e2e2;
		border-radius: 10px;
		background: #fff;
		font: inherit;
		font-size: 0.95rem;
		color: #222;
		cursor: pointer;
		transition: border-color 100ms ease, background 100ms ease, transform 100ms ease;
	}

	.choice:not(:disabled):hover {
		border-color: #1d4ed8;
		background: #f5f9ff;
	}

	.choice:disabled {
		cursor: default;
	}

	.choice.correct {
		border-color: #16a34a;
		background: #f0fdf4;
		color: #14532d;
	}

	.choice.wrong {
		border-color: var(--quiz-danger);
		background: #fef2f2;
		color: #7f1d1d;
	}

	.letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 6px;
		background: #f5f5f5;
		font-size: 1.2rem;
		font-weight: 700;
		color: #555;
		flex-shrink: 0;
	}

	.choice.correct .letter {
		background: #16a34a;
		color: #fff;
	}

	.choice.wrong .letter {
		background: var(--quiz-danger);
		color: #fff;
	}

	.choice-text {
		flex: 1;
	}

	.explanation {
		margin-top: 1.25rem;
		padding: 0.875rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.explanation.correct {
		background: #f0fdf4;
		color: #14532d;
	}

	.explanation.wrong {
		background: #fef2f2;
		color: #7f1d1d;
	}

	.next {
		margin-top: 1rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 8px;
		background: #1d4ed8;
		color: #fff;
		font: inherit;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: background 100ms ease;
	}

	.next:hover {
		background: #1e40af;
	}

	.result-card {
		text-align: center;
		background: #fff;
		border: 1px solid #e2e2e2;
		border-radius: 12px;
		padding: 3rem 2rem;
		margin-top: 1rem;
	}

	.result-label {
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem;
	}

	.result-summary {
		color: #555;
		font-size: 1rem;
		margin: 1.5rem auto 2rem;
		max-width: 36ch;
		line-height: 1.5;
	}

	.result-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.secondary {
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

	.secondary {
		background: #fff;
		color: #1d4ed8;
		border: 1.5px solid #1d4ed8;
	}

	.secondary:hover {
		background: #f5f9ff;
	}
</style>
