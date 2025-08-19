<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ColorPalette from '$lib/components/ColorPalette.svelte';
	import { canvasState } from '$lib/stores/canvas';
	import { onMount } from 'svelte';

	onMount(() => {
		canvasState.setMode('draw');
	});
</script>

<svelte:head>
	<title>Free Draw - Colorama</title>
</svelte:head>

<div class="workspace">
	<header class="workspace-header">
		<a href="/" class="back-btn">← Back</a>
		<h1>Free Draw Mode</h1>
		<button class="save-btn">Save</button>
	</header>
	
	<div class="workspace-content">
		<aside class="sidebar left">
			<Toolbar />
		</aside>
		
		<main class="canvas-area">
			<Canvas />
		</main>
		
		<aside class="sidebar right">
			<ColorPalette />
		</aside>
	</div>
</div>

<style>
	.workspace {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
	}

	.workspace-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.workspace-header h1 {
		margin: 0;
		font-size: 1.25rem;
	}

	.back-btn {
		padding: 0.5rem 1rem;
		background: #f0f0f0;
		border-radius: 4px;
		text-decoration: none;
		color: #333;
		transition: background 0.2s;
	}

	.back-btn:hover {
		background: #e0e0e0;
	}

	.save-btn {
		padding: 0.5rem 1rem;
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.save-btn:hover {
		background: #1976d2;
	}

	.workspace-content {
		flex: 1;
		display: flex;
		gap: 1rem;
		padding: 1rem;
		overflow: hidden;
	}

	.sidebar {
		width: 250px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 1024px) {
		.workspace-content {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			flex-direction: row;
			overflow-x: auto;
			overflow-y: hidden;
		}

		.canvas-area {
			height: 60vh;
		}
	}
</style>