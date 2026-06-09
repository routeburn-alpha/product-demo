<script lang="ts">
	import { base } from '$app/paths';
	import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';
	import type { Pack } from '$lib/packs';

	let { packs, gridId = 'pack-grid' }: { packs: Pack[]; gridId?: string } = $props();

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

	// Category colour-coding — deterministically map each category to a green
	// hue so the same category always reads the same, all within the palette.
	const CATEGORY_GREENS = [
		'var(--green-700)',
		'var(--green-600)',
		'var(--green-800)',
		'var(--green-500)'
	];
	function categoryAccent(category: string): string {
		let h = 0;
		for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
		return CATEGORY_GREENS[h % CATEGORY_GREENS.length];
	}

	function cardLabel(pack: Pack): string {
		const n = pack.questions.length;
		return `${pack.title} — ${pack.category}, ${n} ${n === 1 ? 'question' : 'questions'}`;
	}

	// ── Hover/focus preview popover (floating-ui positioned) ──
	let popoverEl = $state<HTMLDivElement>();
	let activePack = $state<Pack | null>(null);
	let cleanup: (() => void) | undefined;

	function openPreview(node: HTMLElement, pack: Pack) {
		if (!popoverEl) return;
		activePack = pack;
		cleanup?.();
		cleanup = autoUpdate(node, popoverEl, () => {
			if (!popoverEl) return;
			computePosition(node, popoverEl, {
				placement: 'top',
				strategy: 'fixed',
				middleware: [offset(10), flip(), shift({ padding: 8 })]
			}).then(({ x, y }) => {
				if (!popoverEl) return;
				popoverEl.style.left = `${x}px`;
				popoverEl.style.top = `${y}px`;
			});
		});
	}

	function closePreview() {
		activePack = null;
		cleanup?.();
		cleanup = undefined;
	}

	$effect(() => () => cleanup?.());
</script>

<div class="pack-grid" id={gridId}>
	{#each packs as pack (pack.id)}
		{@const range = difficultyRange(pack.questions)}
		{@const showNew = isNew(pack.addedAt)}
		{@const accent = categoryAccent(pack.category)}
		<a
			class="pack-card"
			href="{base}/play/{pack.id}"
			style="--card-accent: {accent}"
			aria-label={cardLabel(pack)}
			onmouseenter={(e) => openPreview(e.currentTarget, pack)}
			onmouseleave={closePreview}
			onfocus={(e) => openPreview(e.currentTarget, pack)}
			onblur={closePreview}
		>
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
				<span class="category"><span class="category-dot" aria-hidden="true"></span>{pack.category}</span>
				<h2>{pack.title}</h2>
				<p class="description">{pack.description}</p>
			</div>
			<div class="footer">
				<span class="count"
					>{pack.questions.length} {pack.questions.length === 1 ? 'question' : 'questions'}</span
				>
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

<!-- Single shared preview popover — decorative (aria-hidden); the card's
     aria-label already conveys its metadata to assistive tech. -->
<div
	class="preview"
	class:visible={activePack !== null}
	bind:this={popoverEl}
	aria-hidden="true"
>
	{#if activePack}
		{@const sample = activePack.questions[0]}
		<p class="preview-label">Sample question</p>
		<p class="preview-q">{sample?.prompt ?? 'No questions yet.'}</p>
	{/if}
</div>

<style>
	/* Masonry-style layout via CSS multi-column: cards keep their natural
	   (varying) heights and flow into balanced columns. The column-width
	   yields the responsive breakpoints — 1 column on mobile, 2–3 on tablet,
	   4+ in the wide desktop grid area. */
	.pack-grid {
		columns: 240px;
		column-gap: 1rem;
	}

	/* Guarantee a single column on the smallest screens. */
	@media (max-width: 480px) {
		.pack-grid {
			columns: 1;
		}
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		break-inside: avoid;
		margin-bottom: 1rem;
		/* Skip rendering work for off-screen cards (cheap perf win for long lists). */
		content-visibility: auto;
		contain-intrinsic-size: 0 320px;
		border: 1px solid var(--quiz-border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--white);
		text-decoration: none;
		color: inherit;
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-medium),
			transform var(--transition-medium);
	}

	.pack-card:hover {
		border-color: var(--card-accent, var(--quiz-hover));
		box-shadow: 0 12px 30px var(--quiz-shadow);
	}

	.pack-card:focus-visible {
		outline: 3px solid var(--quiz-focus);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.pack-card:hover {
			transform: translateY(-4px) scale(1.015);
		}

		.pack-card:active {
			transform: translateY(-1px) scale(0.995);
		}
	}

	.cover {
		position: relative;
		aspect-ratio: 16 / 9;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--quiz-surface);
	}

	.cover-fallback {
		background: linear-gradient(135deg, var(--green-50), var(--green-100));
	}

	.cover-emoji {
		font-size: 3.5rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
	}

	.cover-letter {
		font-size: 3rem;
		font-weight: 800;
		color: var(--green-700);
		letter-spacing: -0.04em;
	}

	.new-pill {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		background: var(--quiz-primary);
		color: var(--quiz-on-primary);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
	}

	/* Pulsing ring on the "New" badge to draw the eye, motion-safe. */
	@media (prefers-reduced-motion: no-preference) {
		.new-pill {
			animation: new-pulse 2s ease-out infinite;
		}
	}

	@keyframes new-pulse {
		0% {
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0 var(--green-500);
		}
		70% {
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 8px rgba(34, 197, 94, 0);
		}
		100% {
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0 rgba(34, 197, 94, 0);
		}
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
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background: var(--green-50);
		color: var(--card-accent, var(--quiz-link));
		align-self: flex-start;
	}

	.category-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--card-accent, var(--quiz-primary));
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

	/* Floating preview popover. */
	.preview {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 50;
		max-width: 260px;
		padding: 0.7rem 0.85rem;
		border: 1.5px solid var(--quiz-primary);
		border-radius: 10px;
		background: var(--white);
		box-shadow: 0 10px 28px var(--quiz-shadow);
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--transition-fast),
			visibility var(--transition-fast);
	}

	.preview.visible {
		opacity: 1;
		visibility: visible;
	}

	.preview-label {
		margin: 0 0 0.25rem;
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--quiz-link);
	}

	.preview-q {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.4;
		color: var(--text-strong);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
