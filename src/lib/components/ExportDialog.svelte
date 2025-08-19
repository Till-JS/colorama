<script lang="ts">
	import { ExportUtils } from '$lib/canvas/utils/export';
	import { createEventDispatcher } from 'svelte';

	export let canvas: HTMLCanvasElement | null = null;
	export let show = false;

	const dispatch = createEventDispatcher();

	let exportFormat: 'png' | 'jpeg' | 'svg' = 'png';
	let filename = 'my-artwork';
	let jpegQuality = 90;
	let includeBackground = false;
	let copying = false;
	let exporting = false;

	async function handleExport() {
		if (!canvas) return;

		exporting = true;
		const fullFilename = `${filename}.${exportFormat}`;

		try {
			switch (exportFormat) {
				case 'png':
					await ExportUtils.exportAsPNG(canvas, fullFilename);
					break;
				case 'jpeg':
					await ExportUtils.exportAsJPEG(canvas, fullFilename, jpegQuality / 100);
					break;
				case 'svg':
					await ExportUtils.exportAsSVG(canvas, fullFilename);
					break;
			}

			dispatch('exported');
			close();
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			exporting = false;
		}
	}

	async function handleCopyToClipboard() {
		if (!canvas) return;

		copying = true;
		try {
			const success = await ExportUtils.copyToClipboard(canvas);
			if (success) {
				dispatch('copied');
				setTimeout(() => (copying = false), 2000);
			} else {
				copying = false;
			}
		} catch (error) {
			console.error('Copy failed:', error);
			copying = false;
		}
	}

	function close() {
		show = false;
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

{#if show}
	<div class="dialog-overlay" on:click={close} on:keydown={handleKeydown}>
		<div class="dialog" on:click|stopPropagation>
			<h2>Export Artwork</h2>

			<div class="form-group">
				<label for="filename">Filename</label>
				<input id="filename" type="text" bind:value={filename} placeholder="my-artwork" />
			</div>

			<div class="form-group">
				<label>Format</label>
				<div class="format-options">
					<label class="radio-option">
						<input type="radio" bind:group={exportFormat} value="png" />
						<span>PNG</span>
						<small>Best for pixel art, supports transparency</small>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={exportFormat} value="jpeg" />
						<span>JPEG</span>
						<small>Smaller file size, no transparency</small>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={exportFormat} value="svg" />
						<span>SVG</span>
						<small>Vector format, scalable</small>
					</label>
				</div>
			</div>

			{#if exportFormat === 'jpeg'}
				<div class="form-group">
					<label for="quality">Quality: {jpegQuality}%</label>
					<input id="quality" type="range" min="10" max="100" step="10" bind:value={jpegQuality} />
				</div>
			{/if}

			<div class="dialog-actions">
				<button
					class="btn-secondary"
					on:click={handleCopyToClipboard}
					disabled={copying || !canvas}
				>
					{copying ? 'Copied!' : 'Copy to Clipboard'}
				</button>
				<button class="btn-cancel" on:click={close}> Cancel </button>
				<button class="btn-primary" on:click={handleExport} disabled={exporting || !canvas}>
					{exporting ? 'Exporting...' : 'Export'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.dialog h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #555;
	}

	.form-group input[type='text'] {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
	}

	.form-group input[type='range'] {
		width: 100%;
	}

	.format-options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.radio-option {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.radio-option:hover {
		border-color: #2196f3;
		background: #f5f5f5;
	}

	.radio-option:has(input:checked) {
		border-color: #2196f3;
		background: #e3f2fd;
	}

	.radio-option input {
		margin-right: 0.5rem;
	}

	.radio-option span {
		font-weight: 500;
		margin-left: 1.5rem;
	}

	.radio-option small {
		margin-left: 1.5rem;
		color: #666;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	.dialog-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e0e0e0;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
	}

	.btn-primary {
		background: #2196f3;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1976d2;
	}

	.btn-secondary {
		background: #4caf50;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #45a049;
	}

	.btn-cancel {
		background: #f5f5f5;
		color: #333;
	}

	.btn-cancel:hover {
		background: #e0e0e0;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.dialog {
			padding: 1.5rem;
		}

		.dialog-actions {
			flex-direction: column;
		}

		button {
			width: 100%;
		}
	}
</style>
