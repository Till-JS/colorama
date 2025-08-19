<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ColorPalette from '$lib/components/ColorPalette.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import { canvasState } from '$lib/stores/canvas';
	import { projectStore } from '$lib/stores/project';
	import { autoSaveStore } from '$lib/stores/autosave';
	import { onMount, onDestroy } from 'svelte';
	import { ExportUtils } from '$lib/canvas/utils/export';

	let canvasElement: HTMLCanvasElement;
	let showExportDialog = false;
	let saving = false;

	onMount(() => {
		canvasState.setMode('pixel');
		// Start auto-save when canvas is ready
		setTimeout(() => {
			const canvas = document.querySelector('.main-canvas') as HTMLCanvasElement;
			if (canvas) {
				canvasElement = canvas;
				autoSaveStore.startAutoSave(canvas);
			}
		}, 100);
	});

	onDestroy(() => {
		autoSaveStore.stopAutoSave();
	});

	async function handleSave() {
		if (!canvasElement || saving) return;
		saving = true;

		try {
			const canvasData = ExportUtils.getDataURL(canvasElement);
			const thumbnail = ExportUtils.generateThumbnail(canvasElement);
			await projectStore.saveProject(canvasData, {
				thumbnail,
				mode: 'pixel'
			});
		} catch (error) {
			console.error('Save failed:', error);
		} finally {
			saving = false;
		}
	}

	function handleExport() {
		showExportDialog = true;
	}
</script>

<svelte:head>
	<title>Pixel Art - Colorama</title>
</svelte:head>

<div class="workspace">
	<header class="workspace-header">
		<a href="/" class="back-btn">← Back</a>
		<h1>Pixel Art Mode</h1>
		<button class="save-btn" on:click={handleSave} disabled={saving}>
			{saving ? 'Saving...' : 'Save'}
		</button>
		<button class="export-btn" on:click={handleExport}>Export</button>
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

<ExportDialog
	bind:show={showExportDialog}
	canvas={canvasElement}
	on:exported={() => console.log('Exported successfully')}
	on:copied={() => console.log('Copied to clipboard')}
/>

{#if $autoSaveStore.enabled && $autoSaveStore.lastSaved}
	<div class="autosave-indicator">
		Auto-saved {$autoSaveStore.lastSaved.toLocaleTimeString()}
	</div>
{/if}

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

	.save-btn:hover:not(:disabled) {
		background: #1976d2;
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.export-btn {
		padding: 0.5rem 1rem;
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.export-btn:hover {
		background: #45a049;
	}

	.autosave-indicator {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		padding: 0.5rem 1rem;
		background: rgba(76, 175, 80, 0.9);
		color: white;
		border-radius: 4px;
		font-size: 0.875rem;
		animation: fadeIn 0.3s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
