<script lang="ts">
	import type { Pack } from '$lib/packs';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import PackGrid from '$lib/components/PackGrid.svelte';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);
</script>

<div class="container">
	<HeroSection {packs} scrollTargetId="pack-grid" />

	<section>
		<PackGrid {packs} gridId="pack-grid" />
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
	}
</style>
