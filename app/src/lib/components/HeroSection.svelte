<script lang="ts">
	import type { Pack } from '$lib/packs';

	let { packs, scrollTargetId = 'pack-grid' }: { packs: Pack[]; scrollTargetId?: string } =
		$props();

	// Quick stats derived from the loaded packs (which come from listPacks()).
	const totalPacks = $derived(packs.length);
	const totalQuestions = $derived(packs.reduce((sum, p) => sum + p.questions.length, 0));
	const totalCategories = $derived(new Set(packs.map((p) => p.category)).size);

	const stats = $derived([
		{ value: totalPacks, label: totalPacks === 1 ? 'pack' : 'packs' },
		{ value: totalQuestions, label: totalQuestions === 1 ? 'question' : 'questions' },
		{ value: totalCategories, label: totalCategories === 1 ? 'category' : 'categories' }
	]);

	// Animated typewriter tagline. The animation is decorative (aria-hidden);
	// a static, screen-reader-friendly version of the full message sits alongside.
	const phrases = ['Race the clock.', 'Rate every question.', 'Watch new packs ship as you play.'];
	let typed = $state(phrases[0]);

	$effect(() => {
		// Browser-only; respect reduced-motion by leaving the static first phrase in place.
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			typed = phrases[0];
			return;
		}

		let phrase = 0;
		let pos = 0;
		let deleting = false;
		let timer: ReturnType<typeof setTimeout>;

		const tick = () => {
			const current = phrases[phrase];
			pos += deleting ? -1 : 1;
			typed = current.slice(0, pos);

			let delay = deleting ? 35 : 70;
			if (!deleting && pos === current.length) {
				delay = 1600; // hold the full phrase
				deleting = true;
			} else if (deleting && pos === 0) {
				deleting = false;
				phrase = (phrase + 1) % phrases.length;
				delay = 350;
			}
			timer = setTimeout(tick, delay);
		};

		typed = '';
		timer = setTimeout(tick, 400);
		return () => clearTimeout(timer);
	});

	function scrollToPacks() {
		const el = document.getElementById(scrollTargetId);
		if (!el) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
		// Move focus to the grid for keyboard users after the scroll.
		el.setAttribute('tabindex', '-1');
		el.focus({ preventScroll: true });
	}

	// Subtle parallax — the hero drifts as the page scrolls (motion-safe only).
	let heroEl = $state<HTMLElement>();
	$effect(() => {
		if (!heroEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const onScroll = () => {
			const shift = Math.min(window.scrollY * 0.15, 40);
			heroEl?.style.setProperty('--parallax', `${shift}px`);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<section class="hero" bind:this={heroEl}>
	<p class="eyebrow">Trivia, leveled up</p>
	<h1>Quiz&nbsp;Arena</h1>

	<p class="tagline">
		<span class="typed" aria-hidden="true">{typed}</span>
		<span class="caret" aria-hidden="true"></span>
		<span class="sr-only">Race the clock, rate every question, and watch new packs ship as you play.</span>
	</p>

	<div class="cta-row">
		<button class="cta" type="button" onclick={scrollToPacks}>
			Start playing
			<span class="cta-arrow" aria-hidden="true">↓</span>
		</button>
	</div>

	<dl class="stats">
		{#each stats as stat (stat.label)}
			<div class="stat">
				<dt class="stat-value">{stat.value}</dt>
				<dd class="stat-label">{stat.label}</dd>
			</div>
		{/each}
	</dl>
</section>

<style>
	.hero {
		text-align: center;
		padding: 1rem 0 2.75rem;
		transform: translateY(var(--parallax, 0));
		will-change: transform;
	}

	/* Fade-in from top on load (motion-safe; overrides the base transform
	   only while running, after which the parallax transform takes over). */
	@media (prefers-reduced-motion: no-preference) {
		.hero {
			animation: hero-in 0.6s ease;
		}
	}

	@keyframes hero-in {
		from {
			opacity: 0;
			transform: translateY(-18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--quiz-link);
	}

	h1 {
		margin: 0;
		font-size: clamp(2.75rem, 8vw, 4.5rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--text-strong);
	}

	.tagline {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.1rem;
		min-height: 1.75rem;
		margin: 1rem 0 0;
		font-size: clamp(1rem, 3.5vw, 1.35rem);
		color: var(--text-muted);
	}

	.typed {
		font-weight: 600;
		color: var(--quiz-link);
	}

	.caret {
		display: inline-block;
		width: 2px;
		height: 1.15em;
		background: var(--quiz-primary);
		margin-left: 2px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.caret {
			animation: blink 1s step-end infinite;
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.cta-row {
		margin-top: 1.75rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.8rem 1.6rem;
		border: none;
		border-radius: 999px;
		background: var(--quiz-primary);
		color: var(--quiz-on-primary);
		font: inherit;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		box-shadow: 0 6px 16px var(--quiz-shadow);
		transition:
			transform var(--transition-fast),
			background var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.cta:hover {
		background: var(--green-800);
	}

	@media (prefers-reduced-motion: no-preference) {
		.cta:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 22px var(--quiz-shadow);
		}

		.cta:active {
			transform: translateY(0) scale(0.97);
		}

		.cta:hover .cta-arrow {
			transform: translateY(2px);
		}
	}

	.cta-arrow {
		transition: transform var(--transition-fast);
	}

	.stats {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1.25rem 2.5rem;
		margin: 2.5rem 0 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
	}

	.stat-value {
		font-size: 1.85rem;
		font-weight: 800;
		line-height: 1;
		color: var(--quiz-primary);
	}

	.stat-label {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 480px) {
		.stats {
			gap: 1rem 1.75rem;
		}
	}
</style>
