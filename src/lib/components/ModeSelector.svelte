<script lang="ts">
	import { canvasState } from '$lib/stores/canvas';
	import { goto } from '$app/navigation';
	import type { DrawingMode } from '$lib/stores/canvas';

	const modes: { id: DrawingMode; name: string; description: string; icon: string }[] = [
		{
			id: 'pixel',
			name: 'Pixel Art',
			description: 'Create retro-style pixel art',
			icon: '🟦'
		},
		{
			id: 'draw',
			name: 'Free Draw',
			description: 'Draw freely with brushes',
			icon: '✏️'
		},
		{
			id: 'mandala',
			name: 'Mandala',
			description: 'Create symmetric patterns',
			icon: '🔮'
		}
	];

	function selectMode(mode: DrawingMode) {
		canvasState.setMode(mode);
		goto(`/${mode}`);
	}
</script>

<div class="mode-selector">
	<h2>Choose Your Canvas Mode</h2>
	<div class="mode-grid">
		{#each modes as mode}
			<button
				class="mode-card"
				class:selected={$canvasState.mode === mode.id}
				on:click={() => selectMode(mode.id)}
			>
				<div class="mode-icon">{mode.icon}</div>
				<h3>{mode.name}</h3>
				<p>{mode.description}</p>
			</button>
		{/each}
	</div>
</div>

<style>
	.mode-selector {
		padding: 2rem;
		text-align: center;
	}

	.mode-selector h2 {
		margin-bottom: 2rem;
		font-size: 1.5rem;
		color: #333;
	}

	.mode-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.mode-card {
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 2rem 1rem;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
	}

	.mode-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		border-color: #2196f3;
	}

	.mode-card.selected {
		background: #e3f2fd;
		border-color: #2196f3;
		box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
	}

	.mode-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.mode-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #333;
	}

	.mode-card p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}

	@media (max-width: 640px) {
		.mode-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
