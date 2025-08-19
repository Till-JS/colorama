import { BaseEngine } from './BaseEngine';
import { get } from 'svelte/store';
import { canvasState } from '$lib/stores/canvas';

export class PixelEngine extends BaseEngine {
	private gridSize = 16;
	private pixelSize: number;
	private gridCanvas: HTMLCanvasElement;
	private gridCtx: CanvasRenderingContext2D;
	private lastPixel: { x: number; y: number } | null = null;

	constructor(canvas: HTMLCanvasElement, gridCanvas: HTMLCanvasElement) {
		super(canvas);
		this.gridCanvas = gridCanvas;
		const ctx = gridCanvas.getContext('2d');
		if (!ctx) throw new Error('Could not get grid context');
		this.gridCtx = ctx;
		
		// Disable image smoothing for pixel-perfect rendering
		this.ctx.imageSmoothingEnabled = false;
		
		this.updateGridSize();
		this.drawGrid();
	}

	protected setupEventListeners() {
		this.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.canvas.addEventListener('touchstart', this.handleTouchStart);
		this.canvas.addEventListener('touchmove', this.handleTouchMove);
		this.canvas.addEventListener('touchend', this.handleTouchEnd);
		
		// Also handle mouse leave to stop drawing
		this.canvas.addEventListener('mouseleave', this.handleMouseUp);
	}

	public setGridSize(size: number) {
		this.gridSize = size;
		this.updateGridSize();
		this.drawGrid();
	}

	private updateGridSize() {
		this.pixelSize = Math.floor(this.width / this.gridSize);
		// Adjust canvas size to fit perfect grid
		const newSize = this.pixelSize * this.gridSize;
		if (newSize !== this.width) {
			this.resize(newSize, newSize);
			this.gridCanvas.width = newSize;
			this.gridCanvas.height = newSize;
		}
	}

	public drawGrid() {
		const state = get(canvasState);
		if (!state.gridEnabled) {
			this.gridCtx.clearRect(0, 0, this.width, this.height);
			return;
		}

		this.gridCtx.clearRect(0, 0, this.width, this.height);
		this.gridCtx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
		this.gridCtx.lineWidth = 1;

		// Draw vertical lines
		for (let i = 0; i <= this.gridSize; i++) {
			const x = i * this.pixelSize;
			this.gridCtx.beginPath();
			this.gridCtx.moveTo(x, 0);
			this.gridCtx.lineTo(x, this.height);
			this.gridCtx.stroke();
		}

		// Draw horizontal lines
		for (let i = 0; i <= this.gridSize; i++) {
			const y = i * this.pixelSize;
			this.gridCtx.beginPath();
			this.gridCtx.moveTo(0, y);
			this.gridCtx.lineTo(this.width, y);
			this.gridCtx.stroke();
		}
	}

	protected handleStart(x: number, y: number) {
		const pixelX = Math.floor(x / this.pixelSize);
		const pixelY = Math.floor(y / this.pixelSize);
		this.drawPixel(pixelX, pixelY);
		this.lastPixel = { x: pixelX, y: pixelY };
	}

	protected handleMove(x: number, y: number) {
		const pixelX = Math.floor(x / this.pixelSize);
		const pixelY = Math.floor(y / this.pixelSize);
		
		// Only draw if we moved to a different pixel
		if (this.lastPixel && (this.lastPixel.x !== pixelX || this.lastPixel.y !== pixelY)) {
			// Draw line between last and current pixel for smooth drawing
			this.drawLine(this.lastPixel.x, this.lastPixel.y, pixelX, pixelY);
			this.lastPixel = { x: pixelX, y: pixelY };
		}
	}

	protected handleEnd() {
		this.lastPixel = null;
		// Save to history
		const imageData = this.getImageData();
		canvasState.addToHistory(imageData);
	}

	private drawPixel(x: number, y: number) {
		if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
		
		const state = get(canvasState);
		
		if (state.tool === 'eraser') {
			this.ctx.clearRect(
				x * this.pixelSize,
				y * this.pixelSize,
				this.pixelSize,
				this.pixelSize
			);
		} else {
			this.ctx.fillStyle = state.color;
			this.ctx.globalAlpha = state.opacity;
			this.ctx.fillRect(
				x * this.pixelSize,
				y * this.pixelSize,
				this.pixelSize,
				this.pixelSize
			);
			this.ctx.globalAlpha = 1;
		}
	}

	private drawLine(x0: number, y0: number, x1: number, y1: number) {
		// Bresenham's line algorithm for pixel-perfect lines
		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		while (true) {
			this.drawPixel(x0, y0);

			if (x0 === x1 && y0 === y1) break;
			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	public fillArea(startX: number, startY: number) {
		// Flood fill algorithm
		const pixelX = Math.floor(startX / this.pixelSize);
		const pixelY = Math.floor(startY / this.pixelSize);
		
		const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
		const targetColor = this.getPixelColor(imageData, pixelX * this.pixelSize, pixelY * this.pixelSize);
		const state = get(canvasState);
		const fillColor = this.hexToRgb(state.color);
		
		if (this.colorsMatch(targetColor, fillColor)) return;
		
		const stack = [[pixelX, pixelY]];
		const visited = new Set<string>();
		
		while (stack.length > 0) {
			const [x, y] = stack.pop()!;
			const key = `${x},${y}`;
			
			if (visited.has(key) || x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
				continue;
			}
			
			visited.add(key);
			
			const currentColor = this.getPixelColor(imageData, x * this.pixelSize, y * this.pixelSize);
			if (!this.colorsMatch(currentColor, targetColor)) continue;
			
			this.drawPixel(x, y);
			
			stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
		}
		
		// Save to history after fill
		const newImageData = this.getImageData();
		canvasState.addToHistory(newImageData);
	}

	private getPixelColor(imageData: ImageData, x: number, y: number): [number, number, number, number] {
		const index = (y * imageData.width + x) * 4;
		return [
			imageData.data[index],
			imageData.data[index + 1],
			imageData.data[index + 2],
			imageData.data[index + 3]
		];
	}

	private hexToRgb(hex: string): [number, number, number, number] {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16),
			255
		] : [0, 0, 0, 255];
	}

	private colorsMatch(c1: [number, number, number, number], c2: [number, number, number, number]): boolean {
		return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
	}
}