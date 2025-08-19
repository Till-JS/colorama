<script lang="ts">
	import { canvasState } from '$lib/stores/canvas';
	import type { Tool } from '$lib/stores/canvas';

	const tools: { id: Tool; icon: string; name: string }[] = [
		{ id: 'brush', icon: '✏️', name: 'Brush' },
		{ id: 'eraser', icon: '🧹', name: 'Eraser' },
		{ id: 'colorPicker', icon: '💧', name: 'Color Picker' },
		{ id: 'fill', icon: '🪣', name: 'Fill' },
		{ id: 'line', icon: '📏', name: 'Line' },
		{ id: 'rectangle', icon: '▭', name: 'Rectangle' },
		{ id: 'circle', icon: '○', name: 'Circle' }
	];

	function selectTool(tool: Tool) {
		canvasState.setTool(tool);
	}
</script>

<div class="toolbar">
	<h3>Tools</h3>
	<div class="tool-grid">
		{#each tools as tool}
			<button
				class="tool-btn"
				class:selected={$canvasState.tool === tool.id}
				on:click={() => selectTool(tool.id)}
				title={tool.name}
			>
				<span class="tool-icon">{tool.icon}</span>
				<span class="tool-name">{tool.name}</span>
			</button>
		{/each}
	</div>
	
	{#if $canvasState.mode === 'pixel'}
		<div class="tool-settings">
			<h4>Grid Settings</h4>
			<div class="setting-row">
				<label>
					<input
						type="checkbox"
						checked={$canvasState.gridEnabled}
						on:change={() => canvasState.toggleGrid()}
					/>
					Show Grid
				</label>
			</div>
			<div class="setting-row">
				<label for="grid-size">Grid Size: {$canvasState.gridSize}x{$canvasState.gridSize}</label>
				<select
					id="grid-size"
					value={$canvasState.gridSize}
					on:change={(e) => canvasState.setGridSize(parseInt(e.currentTarget.value))}
				>
					<option value="8">8x8</option>
					<option value="16">16x16</option>
					<option value="32">32x32</option>
					<option value="64">64x64</option>
					<option value="128">128x128</option>
				</select>
			</div>
		</div>
	{:else if $canvasState.mode === 'draw'}
		<div class="tool-settings">
			<h4>Brush Settings</h4>
			<div class="setting-row">
				<label for="brush-size">Size: {$canvasState.brushSize}px</label>
				<input
					id="brush-size"
					type="range"
					min="1"
					max="50"
					bind:value={$canvasState.brushSize}
					on:input={(e) => canvasState.setBrushSize(parseInt(e.currentTarget.value))}
				/>
			</div>
		</div>
	{:else if $canvasState.mode === 'mandala'}
		<div class="tool-settings">
			<h4>Symmetry Settings</h4>
			<div class="setting-row">
				<label for="symmetry">Segments: {$canvasState.symmetrySegments}</label>
				<input
					id="symmetry"
					type="range"
					min="2"
					max="32"
					step="2"
					bind:value={$canvasState.symmetrySegments}
					on:input={(e) => canvasState.setSymmetrySegments(parseInt(e.currentTarget.value))}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.toolbar {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.toolbar h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.tool-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tool-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background: #f5f5f5;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tool-btn:hover {
		background: #e0e0e0;
	}

	.tool-btn.selected {
		background: #e3f2fd;
		border-color: #2196f3;
	}

	.tool-icon {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.tool-name {
		font-size: 0.75rem;
	}

	.tool-settings {
		border-top: 1px solid #e0e0e0;
		padding-top: 1rem;
	}

	.tool-settings h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
	}

	.setting-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.setting-row label {
		font-size: 0.875rem;
	}

	.setting-row input[type="range"],
	.setting-row select {
		width: 100%;
	}

	.setting-row input[type="checkbox"] {
		margin-right: 0.5rem;
	}
</style>