<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="{base}/manifest.webmanifest" />
	<meta name="theme-color" content="#15803d" />
</svelte:head>

<nav class="top-nav">
	<a class="brand" href="{base}/">Quiz Arena</a>
	<a class="github" href="https://github.com/routeburn-alpha/product-demo-template" rel="noopener" target="_blank">View on GitHub</a>
</nav>

<main>
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

	/* High-contrast green focus ring for keyboard users, app-wide. */
	:global(a:focus-visible),
	:global(button:focus-visible) {
		outline: 3px solid var(--quiz-focus);
		outline-offset: 2px;
		border-radius: 2px;
	}

	:global(body) {
		margin: 0;
		background: #fafafa;
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

	.github {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.github:hover {
		color: var(--quiz-link);
	}
</style>
