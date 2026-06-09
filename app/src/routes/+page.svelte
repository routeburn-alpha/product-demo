<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';
	import HeroSection from '$lib/components/HeroSection.svelte';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);

	const NEW_PILL_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
	const now = Date.now();

	function isNew(addedAt: string | undefined): boolean {
		if (!addedAt) return false;
		const t = Date.parse(addedAt);
		if (Number.isNaN(t)) return false;
		return now - t <= NEW_PILL_WINDOW_MS;
	}

	function difficultyRange(qs: Pack['questions']): { min: number; max: number } | null {
		if (!qs.length) return null;
		let min = Infinity;
		let max = -Infinity;
		for (const q of qs) {
			if (q.difficulty < min) min = q.difficulty;
			if (q.difficulty > max) max = q.difficulty;
		}
		return { min, max };
	}
</script>

<div class="container">
	<HeroSection {packs} scrollTargetId="pack-grid" />

	<section>
		<div class="pack-grid" id="pack-grid">
			{#each packs as pack (pack.id)}
				{@const range = difficultyRange(pack.questions)}
				{@const showNew = isNew(pack.addedAt)}
				<a class="pack-card" href="{base}/play/{pack.id}">
					<div
						class="cover"
						class:cover-fallback={!pack.coverColor}
						style={pack.coverColor ? `background-color: ${pack.coverColor}` : undefined}
					>
						{#if pack.coverEmoji}
							<span class="cover-emoji" aria-hidden="true">{pack.coverEmoji}</span>
						{:else}
							<span class="cover-letter" aria-hidden="true">{pack.title[0]?.toUpperCase() ?? '?'}</span>
						{/if}
						{#if showNew}
							<span class="new-pill">New</span>
						{/if}
					</div>
					<div class="body">
						<span class="category">{pack.category}</span>
						<h2>{pack.title}</h2>
						<p class="description">{pack.description}</p>
					</div>
					<div class="footer">
						<span class="count">{pack.questions.length} {pack.questions.length === 1 ? 'question' : 'questions'}</span>
						{#if range}
							<span
								class="difficulty"
								aria-label={range.min === range.max
									? `Difficulty ${range.min} of 3`
									: `Difficulty ${range.min} to ${range.max} of 3`}
							>
								<span aria-hidden="true">{'★'.repeat(range.min)}</span>
								{#if range.max > range.min}
									<span aria-hidden="true" class="range-dash">–</span>
									<span aria-hidden="true">{'★'.repeat(range.max)}</span>
								{/if}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</section>

	<footer>
		<p>
			Want to add your own pack? Drop a JSON file in <code>app/src/lib/data/packs/</code> and open a PR.
			This whole app is the studio-ai demo loop — every change you see ships through it.
		</p>
	</footer>
</div>

<style>
	.container {
		max-width: 880px;
		margin: 0 auto;
		padding: 2.5rem 2rem;
		font-family: Calibri, sans-serif;
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--quiz-border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--white);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--transition-fast), box-shadow var(--transition-medium), transform var(--transition-medium);
	}

	.pack-card:hover {
		border-color: var(--quiz-hover);
		box-shadow: 0 8px 24px var(--quiz-shadow);
	}

	.pack-card:focus-visible {
		outline: 3px solid var(--quiz-focus);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.pack-card:hover {
			transform: translateY(-3px) scale(1.01);
		}
	}

	.cover {
		position: relative;
		aspect-ratio: 16 / 9;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
	}

	.cover-fallback {
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
	}

	.cover-emoji {
		font-size: 3.5rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
	}

	.cover-letter {
		font-size: 3rem;
		font-weight: 800;
		color: #64748b;
		letter-spacing: -0.04em;
	}

	.new-pill {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		background: #fff;
		color: #111;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 1rem 1.25rem 0.75rem;
		flex: 1;
	}

	h2 {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--text-strong);
		margin: 0;
		line-height: 1.3;
	}

	.category {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background: var(--green-50);
		color: var(--quiz-link);
		align-self: flex-start;
	}

	.description {
		color: var(--text-muted);
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0.15rem 0 0;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		padding: 0.75rem 1.25rem 1rem;
		border-top: 1px solid var(--quiz-border);
	}

	.difficulty {
		color: var(--quiz-secondary);
		letter-spacing: 0.1em;
		white-space: nowrap;
	}

	.range-dash {
		color: var(--text-muted);
		margin: 0 0.25rem;
		letter-spacing: 0;
	}

	footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--quiz-border);
		color: var(--text-muted);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		background: var(--quiz-surface);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	@media (max-width: 375px) {
		.container {
			padding: 1.5rem 1rem;
		}

		.pack-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
