<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasState } from '$lib/stores/canvas';
	import { PixelEngine } from '$lib/canvas/engines/PixelEngine';
	import { DrawEngine } from '$lib/canvas/engines/DrawEngine';
	import { MandalaEngine } from '$lib/canvas/engines/MandalaEngine';
	import type { BaseEngine } from '$lib/canvas/engines/BaseEngine';

	let canvasContainer: HTMLDivElement;
	let mainCanvas: HTMLCanvasElement;
	let gridCanvas: HTMLCanvasElement;
	let engine: BaseEngine | null = null;

	$: mode = $canvasState.mode;
	$: if (engine && mode === 'pixel' && engine instanceof PixelEngine) {
		engine.setGridSize($canvasState.gridSize);
		engine.drawGrid();
	}
	$: if (engine && mode === 'mandala' && engine instanceof MandalaEngine) {
		engine.setSegments($canvasState.symmetrySegments);
	}

	onMount(() => {
		initializeCanvas();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (engine) {
			engine.destroy();
		}
		window.removeEventListener('resize', handleResize);
	});

	function initializeCanvas() {
		const size = Math.min(canvasContainer.clientWidth, canvasContainer.clientHeight, 512);

		mainCanvas.width = size;
		mainCanvas.height = size;
		gridCanvas.width = size;
		gridCanvas.height = size;

		// Destroy previous engine if exists
		if (engine) {
			engine.destroy();
		}

		// Initialize engine based on mode
		switch ($canvasState.mode) {
			case 'pixel':
				engine = new PixelEngine(mainCanvas, gridCanvas);
				break;
			case 'draw':
				engine = new DrawEngine(mainCanvas);
				break;
			case 'mandala':
				engine = new MandalaEngine(mainCanvas, gridCanvas);
				break;
			default:
				engine = new PixelEngine(mainCanvas, gridCanvas);
		}
	}

	// Reinitialize engine when mode changes
	$: if (mode && mainCanvas && gridCanvas) {
		initializeCanvas();
	}

	function handleResize() {
		if (!engine) return;
		const size = Math.min(canvasContainer.clientWidth, canvasContainer.clientHeight, 512);
		engine.resize(size, size);
		gridCanvas.width = size;
		gridCanvas.height = size;

		if (engine instanceof PixelEngine) {
			engine.drawGrid();
		}
	}

	function handleUndo() {
		if ($canvasState.historyStep > 0) {
			canvasState.undo();
			const imageData = $canvasState.history[$canvasState.historyStep];
			if (engine && imageData) {
				engine.putImageData(imageData);
			}
		}
	}

	function handleRedo() {
		if ($canvasState.historyStep < $canvasState.history.length - 1) {
			canvasState.redo();
			const imageData = $canvasState.history[$canvasState.historyStep];
			if (engine && imageData) {
				engine.putImageData(imageData);
			}
		}
	}

	function handleClear() {
		if (engine) {
			engine.clear();
			const imageData = engine.getImageData();
			canvasState.addToHistory(imageData);
		}
	}

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
		} else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
			e.preventDefault();
			handleRedo();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="canvas-wrapper" bind:this={canvasContainer}>
	<div class="canvas-stack">
		<canvas bind:this={mainCanvas} class="main-canvas" />
		<canvas bind:this={gridCanvas} class="grid-canvas" />
	</div>

	<div class="canvas-controls">
		<button
			on:click={handleUndo}
			disabled={$canvasState.historyStep <= 0}
			class="control-btn"
			title="Undo (Cmd/Ctrl+Z)"
		>
			↶
		</button>
		<button
			on:click={handleRedo}
			disabled={$canvasState.historyStep >= $canvasState.history.length - 1}
			class="control-btn"
			title="Redo (Cmd/Ctrl+Y)"
		>
			↷
		</button>
		<button on:click={handleClear} class="control-btn" title="Clear Canvas"> Clear </button>
	</div>
</div>

<style>
	.canvas-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		border-radius: 8px;
		padding: 1rem;
	}

	.canvas-stack {
		position: relative;
		background: white;
		border: 2px solid #333;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.main-canvas,
	.grid-canvas {
		display: block;
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
	}

	.grid-canvas {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.canvas-controls {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
	}

	.control-btn {
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.control-btn:hover:not(:disabled) {
		background: #f0f0f0;
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
