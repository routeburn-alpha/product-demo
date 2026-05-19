<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="top-nav">
	<a class="brand" href="{base}/">Quiz Lab</a>
	<a class="github" href="https://github.com/routeburn-alpha/product-demo-template" rel="noopener" target="_blank">View on GitHub</a>
</nav>

{@render children()}

<style>
	/*
	 * Arsenal FC brand palette — raw colors.
	 * Prefer the semantic --quiz-* aliases below in component styles;
	 * the raw --arsenal-* tokens exist so the palette can be retuned in one place.
	 */
	:global(:root) {
		--arsenal-navy: #023474;  /* Arsenal primary navy — quiz box backgrounds */
		--arsenal-red: #ef0107;   /* Arsenal accent red — CTAs, interactive, error states */
		--arsenal-gold: #9c824a;  /* Arsenal accent gold — highlights and details */
		--arsenal-white: #ffffff; /* On-primary text on navy backgrounds */

		/* Semantic quiz aliases — use these in component CSS. */
		--quiz-primary: var(--arsenal-navy);       /* primary quiz box background */
		--quiz-on-primary: var(--arsenal-white);   /* text on --quiz-primary */
		--quiz-accent: var(--arsenal-gold);        /* highlights and accent details */
		--quiz-secondary: var(--arsenal-red);      /* important CTAs and interactive states */
		--quiz-danger: var(--arsenal-red);         /* error / destructive states */

		/* Neutral text tokens — passes WCAG AA on light surfaces. */
		--text-muted: #737373;                     /* secondary labels (~4.6:1 on #fafafa / #fff) */
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.brand {
		font-weight: 800;
		font-size: 1rem;
		color: #111;
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.github {
		font-size: 0.85rem;
		color: #666;
		text-decoration: none;
	}

	.github:hover {
		color: #1d4ed8;
	}
</style>
