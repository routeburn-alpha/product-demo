<script lang="ts">
	let { count = 6 }: { count?: number } = $props();
	const cards = $derived(Array.from({ length: count }, (_, i) => i));
</script>

<div class="skeleton-grid" aria-hidden="true">
	{#each cards as i (i)}
		<div class="skeleton-card">
			<div class="sk sk-cover"></div>
			<div class="sk-body">
				<div class="sk sk-pill"></div>
				<div class="sk sk-title"></div>
				<div class="sk sk-line"></div>
				<div class="sk sk-line short"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.skeleton-grid {
		columns: 240px;
		column-gap: 1rem;
	}

	@media (max-width: 480px) {
		.skeleton-grid {
			columns: 1;
		}
	}

	.skeleton-card {
		break-inside: avoid;
		margin-bottom: 1rem;
		border: 1px solid var(--quiz-border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--white);
	}

	.sk-body {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1rem 1.25rem 1.25rem;
	}

	.sk {
		border-radius: 6px;
		background: var(--green-50);
	}

	.sk-cover {
		aspect-ratio: 16 / 9;
		border-radius: 0;
	}

	.sk-pill {
		width: 30%;
		height: 0.7rem;
	}

	.sk-title {
		width: 75%;
		height: 1.1rem;
	}

	.sk-line {
		width: 100%;
		height: 0.7rem;
	}

	.sk-line.short {
		width: 55%;
	}

	/* Shimmer sweep for perceived performance (motion-safe). */
	@media (prefers-reduced-motion: no-preference) {
		.sk {
			position: relative;
			overflow: hidden;
		}

		.sk::after {
			content: '';
			position: absolute;
			inset: 0;
			transform: translateX(-100%);
			background: linear-gradient(
				90deg,
				transparent,
				rgba(255, 255, 255, 0.7),
				transparent
			);
			animation: shimmer 1.4s ease-in-out infinite;
		}
	}

	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}
</style>
