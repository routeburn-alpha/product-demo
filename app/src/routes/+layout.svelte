<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import { initPlayer, levelFor, player } from '$lib/player';
	import { initTheme, theme, toggleTheme } from '$lib/theme';

	let { children } = $props();

	onMount(() => {
		initPlayer();
		initTheme();
	});

	// App-like cross-fade between pages via the View Transitions API,
	// when supported and motion is allowed.
	onNavigate((navigation) => {
		if (
			typeof document === 'undefined' ||
			!document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return;
		}
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const level = $derived(levelFor($player.xp).level);
	const showBadge = $derived($player.lastPlayedDate !== null);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="{base}/manifest.webmanifest" />
	<meta name="theme-color" content="#15803d" />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>

<nav class="top-nav">
	<a class="brand" href="{base}/">Quiz Arena</a>
	<div class="nav-right">
		{#if showBadge}
			<span
				class="player-badge"
				aria-label="Level {level}, {$player.xp} XP, {$player.streakDays}-day streak"
			>
				<span class="badge-part">Lv {level}</span>
				<span class="badge-sep" aria-hidden="true">·</span>
				<span class="badge-part">{$player.xp} XP</span>
				{#if $player.streakDays >= 2}
					<span class="badge-sep" aria-hidden="true">·</span>
					<span class="badge-part badge-streak"><span aria-hidden="true">🔥</span> {$player.streakDays}-day</span>
				{/if}
			</span>
		{/if}
		<a class="github" href="https://github.com/routeburn-alpha/product-demo-template" rel="noopener" target="_blank">View on GitHub</a>
		<button
			class="theme-toggle"
			type="button"
			role="switch"
			aria-checked={$theme === 'dark'}
			aria-label="Dark mode"
			title="Toggle dark mode"
			onclick={toggleTheme}
		>
			<span class="theme-icon" aria-hidden="true">{$theme === 'dark' ? '☀️' : '🌙'}</span>
		</button>
	</div>
</nav>

<main id="main-content">
	{@render children()}
</main>

<style>
	/*
	 * Quiz Arena palette (Idea #14) — accessible black / green / white.
	 * A forest-green ramp plus semantic --quiz-* aliases; prefer the aliases
	 * in component styles so the palette can be retuned in one place.
	 * Contrast notes assume a white / near-white background; every text
	 * pairing called out below meets WCAG AA (>= 4.5:1).
	 */
	:global(:root) {
		/* Green ramp — raw tokens. */
		--green-900: #14532d;
		--green-800: #166534; /* interactive text on white — 6.3:1 */
		--green-700: #15803d; /* primary fills — white text = 5.0:1 */
		--green-600: #16a34a;
		--green-500: #22c55e; /* hover / highlight */
		--green-100: #dcfce7;
		--green-50: #f0fdf4;  /* faint green surface */

		--ink: #111111;       /* near-black — primary text & nav */
		--white: #ffffff;
		--gray-50: #f5f5f5;   /* card / surface background */
		--gray-200: #e5e7eb;  /* subtle borders */
		--gray-500: #6b7280;  /* muted text — 4.8:1 on white */

		/* Semantic quiz aliases — use these in component CSS. */
		--quiz-primary: var(--green-700);      /* primary brand / quiz box background */
		--quiz-on-primary: var(--white);       /* text on --quiz-primary (5:1) */
		--quiz-secondary: var(--green-600);    /* secondary green accents */
		--quiz-accent: var(--ink);             /* black accent details */
		--quiz-hover: var(--green-500);        /* hover state */
		--quiz-link: var(--green-800);         /* interactive text on white (6:1) */
		--quiz-focus: var(--green-700);        /* high-contrast focus ring */

		--quiz-surface: var(--gray-50);        /* card backgrounds */
		--quiz-border: var(--gray-200);        /* subtle borders */
		--quiz-shadow: rgba(17, 24, 39, 0.1);  /* elevation */

		--text-strong: var(--ink);             /* primary text */
		--text-muted: var(--gray-500);         /* secondary labels — AA on white */

		/* Motion tokens. */
		--transition-fast: 0.2s ease;
		--transition-medium: 0.3s ease;
		--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

		/*
		 * Legacy Arsenal raws — preserved so the play view keeps rendering
		 * pending its own migration (Idea #14 follow-up: retire the red
		 * wrong-answer feedback to fully meet the black/green/white standard).
		 */
		--arsenal-navy: #023474;
		--arsenal-red: #ef0107;
		--arsenal-gold: #9c824a;
		--arsenal-white: #ffffff;
		--quiz-danger: var(--arsenal-red); /* play-view incorrect state (pre-existing red) */
	}

	/*
	 * Dark theme (Idea #14). Active when <html data-theme="dark"> — set by
	 * src/lib/theme.ts on toggle and by the no-FOUC inline script in app.html.
	 * Same black / green / white system, inverted: near-black surfaces, greens
	 * brightened so green *text* clears WCAG AA on dark, and light neutrals for
	 * body copy. Overriding the tokens here retunes every token-based component
	 * (home, hero, pack grid, filters, search) in one place.
	 */
	:global(:root[data-theme='dark']) {
		color-scheme: dark;

		/* Green ramp — retuned for dark surfaces. */
		--green-100: #14331f; /* faint green surface → dark tint */
		--green-50: #0f2417;  /* fainter green surface → darker tint */

		--ink: #e9f1ea;       /* near-white — primary text on dark */
		--white: #161c17;     /* raised card / control surface (was pure white) */
		--gray-50: #10160f;   /* app surface */
		--gray-200: #2c362d;  /* subtle borders */
		--gray-500: #9aa89b;  /* muted text — AA on dark surfaces */

		/* Green fills keep white text (5:1); interactive green *text* brightens. */
		--quiz-primary: var(--green-700);
		--quiz-on-primary: #ffffff; /* real white on green (don't inherit --white) */
		--quiz-secondary: #4ade80;
		--quiz-hover: #22c55e;
		--quiz-link: #4ade80;       /* green interactive text — ~8:1 on dark */
		--quiz-focus: #22c55e;      /* visible focus ring on dark */

		--quiz-surface: #1b221c;
		--quiz-border: var(--gray-200);
		--quiz-shadow: rgba(0, 0, 0, 0.55);

		--text-strong: var(--ink);
		--text-muted: var(--gray-500);
	}

	/* High-contrast green focus ring for keyboard users, app-wide. */
	:global(a:focus-visible),
	:global(button:focus-visible),
	:global(input:focus-visible),
	:global(select:focus-visible) {
		outline: 3px solid var(--quiz-focus);
		outline-offset: 2px;
		border-radius: 2px;
	}

	/* Skip link — visually hidden until focused. */
	.skip-link {
		position: absolute;
		left: 0.5rem;
		top: -3rem;
		z-index: 100;
		padding: 0.5rem 0.9rem;
		border-radius: 0 0 8px 8px;
		background: var(--quiz-primary);
		color: var(--quiz-on-primary);
		font-family: Calibri, sans-serif;
		font-weight: 700;
		text-decoration: none;
		transition: top var(--transition-fast);
	}

	.skip-link:focus {
		top: 0;
	}

	/* Respect Windows high-contrast / forced-colors mode. */
	@media (prefers-contrast: more) {
		.top-nav {
			border-bottom: 1px solid var(--ink);
		}
	}

	:global(body) {
		margin: 0;
		background: #fafafa;
	}

	:global(:root[data-theme='dark'] body) {
		background: #0c110c;
	}

	.top-nav {
		max-width: 880px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: Calibri, sans-serif;
	}

	.brand {
		font-weight: 800;
		font-size: 1rem;
		color: var(--text-strong);
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Player progression badge — uses the green palette tokens. */
	.player-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.7rem;
		border: 1px solid var(--green-800);
		border-radius: 999px;
		background: var(--green-50);
		color: var(--green-800);
		font-size: 0.8rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.badge-sep {
		color: var(--green-600);
		font-weight: 400;
	}

	.badge-streak {
		color: var(--green-900);
	}

	/* Badge greens are too dark to read on the dark tint — brighten in dark mode. */
	:global(:root[data-theme='dark']) .player-badge {
		border-color: #2f7d4f;
		color: #7ee2a8;
	}

	:global(:root[data-theme='dark']) .badge-sep {
		color: #4ade80;
	}

	:global(:root[data-theme='dark']) .badge-streak {
		color: #a7f3c4;
	}

	/* Dark-mode toggle — a circular icon button that fits the nav. */
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.1rem;
		height: 2.1rem;
		padding: 0;
		border: 1px solid var(--quiz-border);
		border-radius: 999px;
		background: var(--quiz-surface);
		cursor: pointer;
		line-height: 1;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.theme-toggle:hover {
		border-color: var(--quiz-hover);
	}

	@media (prefers-reduced-motion: no-preference) {
		.theme-toggle:active {
			transform: scale(0.92);
		}
	}

	.theme-icon {
		font-size: 1rem;
	}

	.github {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.github:hover {
		color: var(--quiz-link);
	}

	@media (max-width: 420px) {
		.player-badge {
			font-size: 0.72rem;
			padding: 0.25rem 0.55rem;
		}
	}
</style>
