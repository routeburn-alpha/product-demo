<script lang="ts">
	import Fuse from 'fuse.js';
	import { navigating } from '$app/stores';
	import type { Pack } from '$lib/packs';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import PackGrid from '$lib/components/PackGrid.svelte';
	import PackGridSkeleton from '$lib/components/PackGridSkeleton.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';

	type SortKey = 'recent' | 'difficulty' | 'az';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);

	// ── Filter / search / sort state (initialised from the URL on mount) ──
	let query = $state('');
	let category = $state('All');
	let sort = $state<SortKey>('recent');

	const categories = $derived([
		'All',
		...Array.from(new Set(packs.map((p) => p.category))).sort((a, b) => a.localeCompare(b))
	]);

	const fuse = $derived(
		new Fuse(packs, {
			// Weight title/category above description so a query matches the most
			// relevant field; a tighter threshold + min match length keeps fuzzy
			// search from returning unrelated packs (e.g. "ski" matched 4 before).
			keys: [
				{ name: 'title', weight: 3 },
				{ name: 'category', weight: 2 },
				'description',
				'tags'
			],
			threshold: 0.3,
			ignoreLocation: true,
			minMatchCharLength: 2
		})
	);

	function minDifficulty(p: Pack): number {
		return p.questions.reduce((m, q) => Math.min(m, q.difficulty), Infinity);
	}

	function sortPacks(list: Pack[], key: SortKey): Pack[] {
		const copy = [...list];
		if (key === 'az') return copy.sort((a, b) => a.title.localeCompare(b.title));
		if (key === 'difficulty') return copy.sort((a, b) => minDifficulty(a) - minDifficulty(b));
		// 'recent' — newest addedAt first; undated packs sink to the bottom.
		return copy.sort((a, b) => {
			const ta = a.addedAt ? Date.parse(a.addedAt) : -Infinity;
			const tb = b.addedAt ? Date.parse(b.addedAt) : -Infinity;
			return tb - ta;
		});
	}

	const searched = $derived(
		query.trim() ? fuse.search(query.trim()).map((r) => r.item) : packs
	);
	const filtered = $derived(
		category === 'All' ? searched : searched.filter((p) => p.category === category)
	);
	const visible = $derived(sortPacks(filtered, sort));

	const isFiltering = $derived(query.trim() !== '' || category !== 'All');
	const resultLabel = $derived(`${visible.length} ${visible.length === 1 ? 'pack' : 'packs'}`);

	function resetFilters() {
		query = '';
		category = 'All';
		sort = 'recent';
	}

	// Show skeletons while a client-side navigation *to this page* is in flight.
	const loading = $derived(!!$navigating && $navigating.to?.route?.id === '/');

	// ── URL state preservation (browser-only) ──
	let initialised = false;

	$effect(() => {
		// Initialise from the URL once, on mount — must run before the writer below.
		if (initialised) return;
		const params = new URLSearchParams(window.location.search);
		query = params.get('q') ?? '';
		const cat = params.get('cat');
		if (cat && categories.includes(cat)) category = cat;
		const s = params.get('sort');
		if (s === 'difficulty' || s === 'az' || s === 'recent') sort = s;
		initialised = true;
	});

	$effect(() => {
		// Mirror state into the URL (after init, so we don't clobber inbound params).
		const q = query.trim();
		const cat = category;
		const s = sort;
		if (!initialised) return;
		const url = new URL(window.location.href);
		const params = url.searchParams;
		q ? params.set('q', q) : params.delete('q');
		cat !== 'All' ? params.set('cat', cat) : params.delete('cat');
		s !== 'recent' ? params.set('sort', s) : params.delete('sort');
		const next = `${url.pathname}${params.toString() ? `?${params}` : ''}`;
		history.replaceState(history.state, '', next);
	});
</script>

<div class="container">
	<HeroSection {packs} scrollTargetId="pack-grid" />

	<section class="browse" aria-labelledby="browse-heading">
		<h2 id="browse-heading" class="sr-only">Browse packs</h2>
		<div class="sidebar">
			<SearchBar bind:value={query} />
			<CategoryFilter {categories} bind:selected={category} bind:sort />
		</div>

		<div class="results">
			<div class="result-bar">
				<span class="result-count">{resultLabel}</span>
				{#if isFiltering}
					<button class="reset" type="button" onclick={resetFilters}>Clear filters</button>
				{/if}
			</div>

			<!-- Announce result-count changes to screen readers. -->
			<p class="sr-only" role="status" aria-live="polite">{resultLabel} found</p>

			{#if loading}
				<PackGridSkeleton count={packs.length || 6} />
			{:else if visible.length > 0}
				<PackGrid packs={visible} gridId="pack-grid" />
			{:else}
				<div class="empty" id="pack-grid">
					<p class="empty-emoji" aria-hidden="true">🔍</p>
					<p class="empty-title">No packs match your search</p>
					<button class="reset" type="button" onclick={resetFilters}>Clear filters</button>
				</div>
			{/if}
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

	/* Mobile / tablet: filters stack above the results. */
	.sidebar {
		margin-bottom: 1rem;
	}

	/* Filter controls slide in from the side on load (motion-safe). */
	@media (prefers-reduced-motion: no-preference) {
		.sidebar {
			animation: slide-in-side 0.5s ease 0.1s backwards;
		}
	}

	@keyframes slide-in-side {
		from {
			opacity: 0;
			transform: translateX(-16px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	/* Desktop (>= 1025px): a sticky filter sidebar beside a wider grid. */
	@media (min-width: 1025px) {
		.container {
			max-width: 1180px;
		}

		.browse {
			display: grid;
			grid-template-columns: 240px 1fr;
			gap: 2rem;
			align-items: start;
		}

		.sidebar {
			position: sticky;
			top: 1rem;
			margin-bottom: 0;
		}
	}

	.result-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin: 0.25rem 0 1.25rem;
	}

	.result-count {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.reset {
		border: none;
		background: none;
		padding: 0.25rem 0.25rem;
		color: var(--quiz-link);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		border: 1px dashed var(--quiz-border);
		border-radius: 12px;
		background: var(--quiz-surface);
	}

	.empty-emoji {
		font-size: 2.5rem;
		margin: 0 0 0.5rem;
	}

	.empty-title {
		font-weight: 700;
		color: var(--text-strong);
		margin: 0 0 1rem;
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
