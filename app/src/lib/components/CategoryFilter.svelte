<script lang="ts">
	type SortKey = 'recent' | 'difficulty' | 'az';

	let {
		categories,
		selected = $bindable('All'),
		sort = $bindable('recent' as SortKey)
	}: { categories: string[]; selected?: string; sort?: SortKey } = $props();
</script>

<div class="cf-root">
	<div class="filters">
		<div class="pills" role="group" aria-label="Filter packs by category">
		{#each categories as cat (cat)}
			<button
				class="pill"
				class:active={selected === cat}
				type="button"
				aria-pressed={selected === cat}
				onclick={() => (selected = cat)}
			>
				{cat}
			</button>
		{/each}
	</div>

	<label class="sort">
		<span class="sort-label">Sort</span>
		<select bind:value={sort} aria-label="Sort packs">
			<option value="recent">Recently added</option>
			<option value="difficulty">Difficulty</option>
			<option value="az">A–Z</option>
		</select>
	</label>
	</div>
</div>

<style>
	/* Pills stack vertically, with the sort control beneath them — no
	   horizontal scroll, so every category is visible regardless of width. */
	.filters {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-top: 1rem;
	}

	/* Vertical category selector — pills stack so every category is visible at
	   once, with no horizontal scroll. */
	.pills {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.pill {
		flex: 0 0 auto;
		min-height: 36px;
		padding: 0.4rem 0.9rem;
		border: 1.5px solid var(--quiz-border);
		border-radius: 999px;
		background: var(--white);
		color: var(--text-strong);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast);
	}

	.pill:hover {
		border-color: var(--quiz-hover);
	}

	.pill.active {
		background: var(--quiz-primary);
		border-color: var(--quiz-primary);
		color: var(--quiz-on-primary);
	}

	@media (prefers-reduced-motion: no-preference) {
		.pill:active {
			transform: scale(0.95);
		}
	}

	/* Larger touch targets on coarse pointers. */
	@media (pointer: coarse) {
		.pill {
			min-height: 44px;
		}
	}

	.sort {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		flex: 0 0 auto;
	}

	.sort-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	select {
		min-height: 36px;
		padding: 0.3rem 0.5rem;
		border: 1.5px solid var(--quiz-border);
		border-radius: 8px;
		background: var(--white);
		color: var(--text-strong);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}

	select:focus-visible {
		outline: 3px solid var(--quiz-focus);
		outline-offset: 2px;
	}
</style>
