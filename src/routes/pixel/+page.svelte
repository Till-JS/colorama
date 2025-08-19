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
	import { handleKeyboardShortcut, shortcuts } from '$lib/utils/keyboard';

	let canvasElement: HTMLCanvasElement;
	let showExportDialog = false;
	let showShortcuts = false;
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

	function handleGlobalKeydown(event: KeyboardEvent) {
		// Don't handle shortcuts if a dialog is open
		if (showExportDialog || showShortcuts) return;
		
		handleKeyboardShortcut(event);
	}

	function toggleShortcuts() {
		showShortcuts = !showShortcuts;
	}
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

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
		<button class="shortcut-btn" on:click={toggleShortcuts} title="Keyboard Shortcuts">
			⌨️
		</button>
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

{#if showShortcuts}
	<div class="shortcuts-overlay" on:click={toggleShortcuts}>
		<div class="shortcuts-dialog" on:click|stopPropagation>
			<h2>⌨️ Keyboard Shortcuts</h2>
			<div class="shortcuts-grid">
				<div class="shortcut-section">
					<h3>Tools</h3>
					<div class="shortcut-item">
						<kbd>B</kbd> <span>Brush</span>
					</div>
					<div class="shortcut-item">
						<kbd>E</kbd> <span>Eraser</span>
					</div>
					<div class="shortcut-item">
						<kbd>F</kbd> <span>Fill</span>
					</div>
					<div class="shortcut-item">
						<kbd>L</kbd> <span>Line</span>
					</div>
					<div class="shortcut-item">
						<kbd>R</kbd> <span>Rectangle</span>
					</div>
					<div class="shortcut-item">
						<kbd>C</kbd> <span>Circle</span>
					</div>
					<div class="shortcut-item">
						<kbd>I</kbd> <span>Color Picker</span>
					</div>
				</div>
				
				<div class="shortcut-section">
					<h3>Brush Size</h3>
					<div class="shortcut-item">
						<kbd>1-5</kbd> <span>Set size</span>
					</div>
					<div class="shortcut-item">
						<kbd>[</kbd> <span>Decrease</span>
					</div>
					<div class="shortcut-item">
						<kbd>]</kbd> <span>Increase</span>
					</div>
				</div>
				
				<div class="shortcut-section">
					<h3>Opacity</h3>
					<div class="shortcut-item">
						<kbd>0</kbd> <span>100%</span>
					</div>
					<div class="shortcut-item">
						<kbd>6-9</kbd> <span>60-90%</span>
					</div>
				</div>
				
				<div class="shortcut-section">
					<h3>Canvas</h3>
					<div class="shortcut-item">
						<kbd>G</kbd> <span>Toggle Grid</span>
					</div>
					<div class="shortcut-item">
						<kbd>Cmd/Ctrl+Z</kbd> <span>Undo</span>
					</div>
					<div class="shortcut-item">
						<kbd>Cmd/Ctrl+Y</kbd> <span>Redo</span>
					</div>
				</div>
			</div>
			<button class="close-btn" on:click={toggleShortcuts}>Close</button>
		</div>
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

	.shortcut-btn {
		padding: 0.5rem 1rem;
		background: #9c27b0;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 1.25rem;
	}

	.shortcut-btn:hover {
		background: #7b1fa2;
	}

	.shortcuts-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(4px);
	}

	.shortcuts-dialog {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 800px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.shortcuts-dialog h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		text-align: center;
	}

	.shortcuts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.shortcut-section h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: #666;
		text-transform: uppercase;
		font-weight: 600;
	}

	.shortcut-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.shortcut-item kbd {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.875rem;
		min-width: 2rem;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.shortcut-item span {
		color: #333;
		font-size: 0.875rem;
	}

	.close-btn {
		display: block;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: #1976d2;
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
