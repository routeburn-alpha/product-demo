<script lang="ts">
	let { value = $bindable('') }: { value?: string } = $props();
	let inputEl = $state<HTMLInputElement>();

	function clear() {
		value = '';
		inputEl?.focus();
	}
</script>

<div class="search">
	<span class="icon" aria-hidden="true">🔍</span>
	<input
		bind:this={inputEl}
		bind:value
		type="search"
		placeholder="Search packs…"
		aria-label="Search quiz packs by title, category, or description"
		autocomplete="off"
		spellcheck="false"
	/>
	{#if value}
		<button class="clear" type="button" onclick={clear} aria-label="Clear search">×</button>
	{/if}
</div>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0.75rem;
		border: 1.5px solid var(--quiz-border);
		border-radius: 999px;
		background: var(--white);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	/* Expanding-border focus affordance. */
	.search:focus-within {
		border-color: var(--quiz-primary);
		box-shadow: 0 0 0 3px var(--green-100);
	}

	.icon {
		font-size: 0.95rem;
		opacity: 0.7;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 44px;
		border: none;
		outline: none;
		background: transparent;
		font: inherit;
		font-size: 0.95rem;
		color: var(--text-strong);
	}

	input::placeholder {
		color: var(--text-muted);
	}

	/* Hide the native search clear (we render our own). */
	input::-webkit-search-cancel-button {
		appearance: none;
	}

	.clear {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: 999px;
		background: var(--quiz-surface);
		color: var(--text-strong);
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.clear:hover {
		background: var(--green-100);
	}
</style>
