<script lang="ts">
	import { canvasState } from '$lib/stores/canvas';

	const presetColors = [
		'#000000',
		'#FFFFFF',
		'#FF0000',
		'#00FF00',
		'#0000FF',
		'#FFFF00',
		'#FF00FF',
		'#00FFFF',
		'#FFA500',
		'#800080',
		'#FFC0CB',
		'#A52A2A',
		'#808080',
		'#C0C0C0',
		'#FFD700'
	];

	let customColor = $canvasState.color;

	function selectColor(color: string) {
		canvasState.setColor(color);
		customColor = color;
	}

	function handleCustomColor(e: Event) {
		const target = e.target as HTMLInputElement;
		selectColor(target.value);
	}
</script>

<div class="color-palette">
	<div class="palette-header">
		<h3>Colors</h3>
		<div class="current-color" style="background-color: {$canvasState.color}"></div>
	</div>

	<div class="preset-colors">
		{#each presetColors as color}
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
