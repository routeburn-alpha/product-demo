<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);
</script>

<div class="container">
	<header>
		<h1>Quiz Lab</h1>
		<p class="subtitle">Pick a pack. Race the clock. Rate the questions. Watch packs ship while you play.</p>
	</header>

	<section>
		<div class="pack-grid">
			{#each packs as pack (pack.id)}
				<a class="pack-card" href="{base}/play/{pack.id}">
					<div class="pack-header">
						<h2>{pack.title}</h2>
						<span class="category">{pack.category}</span>
					</div>
					<p class="description">{pack.description}</p>
					<div class="meta">
						<span class="count">{pack.questions.length} questions</span>
						<span class="play">Play →</span>
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	header {
		margin-bottom: 2.5rem;
	}

	h1 {
		font-size: 2.25rem;
		font-weight: 800;
		color: #111;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: #555;
		margin: 0.5rem 0 0;
		font-size: 1rem;
		max-width: 60ch;
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border: 1px solid #e2e2e2;
		border-radius: 12px;
		padding: 1.25rem;
		background: #fff;
		text-decoration: none;
		color: inherit;
		transition: border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
	}

	.pack-card:hover {
		border-color: #1d4ed8;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(29, 78, 216, 0.08);
	}

	.pack-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}

	h2 {
		font-size: 1.05rem;
		font-weight: 700;
		color: #111;
		margin: 0;
	}

	.category {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: #f0f9ff;
		color: #1d4ed8;
		white-space: nowrap;
	}

	.description {
		color: #555;
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.play {
		color: #1d4ed8;
		font-weight: 600;
	}

	footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e2e2;
		color: #666;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		background: #f5f5f5;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
	}
</style>
