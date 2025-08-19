<script lang="ts">
	import { canvasState } from '$lib/stores/canvas';
	import { palettes, type ColorPalette } from '$lib/utils/palettes';

	let selectedPalette = palettes[0];
	let customColor = $canvasState.color;
	let showPaletteMenu = false;

	function selectColor(color: string) {
		canvasState.setColor(color);
		customColor = color;
	}

	function handleCustomColor(e: Event) {
		const target = e.target as HTMLInputElement;
		selectColor(target.value);
	}

	function togglePaletteMenu() {
		showPaletteMenu = !showPaletteMenu;
	}

	function selectPalette(palette: ColorPalette) {
		selectedPalette = palette;
		showPaletteMenu = false;
	}
</script>

<div class="color-palette">
	<div class="palette-header">
		<h3>Colors</h3>
		<div class="current-color" style="background-color: {$canvasState.color}"></div>
	</div>

	<div class="palette-selector">
		<button class="palette-btn" on:click={togglePaletteMenu}>
			🎨 {selectedPalette.name}
			<span class="arrow">{showPaletteMenu ? '▲' : '▼'}</span>
		</button>
		
		{#if showPaletteMenu}
			<div class="palette-dropdown">
				{#each palettes as palette}
					<button 
						class="palette-option" 
						class:selected={selectedPalette.name === palette.name}
						on:click={() => selectPalette(palette)}
					>
						<span class="palette-name">{palette.name}</span>
						{#if palette.description}
							<span class="palette-desc">{palette.description}</span>
						{/if}
						<div class="palette-preview">
							{#each palette.colors.slice(0, 8) as color}
								<span class="preview-color" style="background-color: {color}"></span>
							{/each}
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="preset-colors">
		{#each selectedPalette.colors as color}
			<button
				class="color-btn"
				class:selected={$canvasState.color === color}
				style="background-color: {color}"
				on:click={() => selectColor(color)}
				title={color}
			/>
		{/each}
	</div>

	<div class="custom-color">
		<label for="color-picker">Custom:</label>
		<input id="color-picker" type="color" bind:value={customColor} on:input={handleCustomColor} />
	</div>

	<div class="opacity-control">
		<label for="opacity">Opacity: {Math.round($canvasState.opacity * 100)}%</label>
		<input
			id="opacity"
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={$canvasState.opacity}
			on:input={(e) => canvasState.setOpacity(parseFloat(e.currentTarget.value))}
		/>
	</div>
</div>

<style>
	.color-palette {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.palette-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.palette-header h3 {
		margin: 0;
		font-size: 1rem;
	}

	.current-color {
		width: 2rem;
		height: 2rem;
		border: 2px solid #333;
		border-radius: 4px;
	}

	.preset-colors {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.color-btn {
		width: 2rem;
		height: 2rem;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.color-btn:hover {
		transform: scale(1.1);
	}

	.color-btn.selected {
		border-color: #333;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #333;
	}

	.custom-color,
	.opacity-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.custom-color label,
	.opacity-control label {
		font-size: 0.875rem;
		flex: 1;
	}

	.palette-selector {
		position: relative;
		margin-bottom: 1rem;
	}

	.palette-btn {
		width: 100%;
		padding: 0.5rem;
		background: #f0f0f0;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.palette-btn:hover {
		background: #e0e0e0;
	}

	.palette-btn .arrow {
		font-size: 0.75rem;
		opacity: 0.6;
	}

	.palette-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-height: 300px;
		overflow-y: auto;
		z-index: 100;
		margin-top: 0.25rem;
	}

	.palette-option {
		width: 100%;
		padding: 0.75rem;
		background: none;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
	}

	.palette-option:last-child {
		border-bottom: none;
	}

	.palette-option:hover {
		background: #f8f8f8;
	}

	.palette-option.selected {
		background: #e3f2fd;
	}

	.palette-name {
		display: block;
		font-weight: 500;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.palette-desc {
		display: block;
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.palette-preview {
		display: flex;
		gap: 2px;
	}

	.preview-color {
		width: 16px;
		height: 16px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	input[type='color'] {
		width: 3rem;
		height: 2rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}

	input[type='range'] {
		flex: 1;
	}
</style>
