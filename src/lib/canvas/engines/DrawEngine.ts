import { BaseEngine } from './BaseEngine';
import { get } from 'svelte/store';
import { canvasState } from '$lib/stores/canvas';

interface Point {
	x: number;
	y: number;
	pressure?: number;
}

export class DrawEngine extends BaseEngine {
	private points: Point[] = [];
	private smoothing = 0.5;
	private pressureSupported = false;
	private minWidth = 1;
	private maxWidth = 50;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		// Enable smooth drawing
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';

		// Check for pressure support
		this.checkPressureSupport();
	}

	protected setupEventListeners() {
		this.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.canvas.addEventListener('touchstart', this.handleTouchStart);
		this.canvas.addEventListener('touchmove', this.handleTouchMove);
		this.canvas.addEventListener('touchend', this.handleTouchEnd);
		this.canvas.addEventListener('mouseleave', this.handleMouseUp);

		// Pointer events for pressure
		this.canvas.addEventListener('pointerdown', this.handlePointerDown);
		this.canvas.addEventListener('pointermove', this.handlePointerMove);
		this.canvas.addEventListener('pointerup', this.handlePointerUp);
	}

	private checkPressureSupport() {
		// Check if PointerEvent supports pressure
		if (window.PointerEvent && 'pressure' in PointerEvent.prototype) {
			this.pressureSupported = true;
		}
	}

	protected handleStart(x: number, y: number, pressure = 1) {
		const state = get(canvasState);
		this.points = [{ x, y, pressure }];

		// Start drawing
		this.ctx.globalAlpha = state.opacity;
		this.ctx.strokeStyle = state.tool === 'eraser' ? 'white' : state.color;
		this.ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';

		// Draw initial point
		this.drawPoint(x, y, this.calculateWidth(pressure, state.brushSize));
	}

	protected handleMove(x: number, y: number, pressure = 1) {
		if (!this.isDrawing) return;

		const state = get(canvasState);
		this.points.push({ x, y, pressure });

		// Apply smoothing if we have enough points
		if (this.points.length > 2) {
			const smoothedPoints = this.smoothPath(this.points);
			this.drawSmoothLine(smoothedPoints, state.brushSize);
		} else {
			// Simple line for first few points
			const lastPoint = this.points[this.points.length - 2];
			this.drawLine(lastPoint, { x, y, pressure }, state.brushSize);
		}
	}

	protected handleEnd() {
		if (this.points.length > 0) {
			// Final smoothing pass
			const state = get(canvasState);
			if (this.points.length > 2) {
				const smoothedPoints = this.smoothPath(this.points);
				this.redrawPath(smoothedPoints, state.brushSize);
			}

			// Save to history
			const imageData = this.getImageData();
			canvasState.addToHistory(imageData);
		}

		this.points = [];
		this.ctx.globalAlpha = 1;
		this.ctx.globalCompositeOperation = 'source-over';
	}

	private drawPoint(x: number, y: number, width: number) {
		this.ctx.beginPath();
		this.ctx.arc(x, y, width / 2, 0, Math.PI * 2);
		this.ctx.fill();
	}

	private drawLine(from: Point, to: Point, baseWidth: number) {
		const width = this.calculateWidth(((from.pressure || 1) + (to.pressure || 1)) / 2, baseWidth);

		this.ctx.lineWidth = width;
		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
	}

	private drawSmoothLine(points: Point[], baseWidth: number) {
		if (points.length < 2) return;

		// Clear and redraw the entire path for smoothness
		this.ctx.save();

		// Draw using quadratic curves
		this.ctx.beginPath();
		this.ctx.moveTo(points[0].x, points[0].y);

		for (let i = 1; i < points.length - 1; i++) {
			const cp = points[i];
			const next = points[i + 1];
			const midX = (cp.x + next.x) / 2;
			const midY = (cp.y + next.y) / 2;

			// Vary line width based on pressure
			const width = this.calculateWidth(cp.pressure || 1, baseWidth);
			this.ctx.lineWidth = width;

			this.ctx.quadraticCurveTo(cp.x, cp.y, midX, midY);
			this.ctx.stroke();
			this.ctx.beginPath();
			this.ctx.moveTo(midX, midY);
		}

		// Draw the last segment
		if (points.length > 1) {
			const last = points[points.length - 1];
			const secondLast = points[points.length - 2];
			this.ctx.lineWidth = this.calculateWidth(last.pressure || 1, baseWidth);
			this.ctx.lineTo(last.x, last.y);
			this.ctx.stroke();
		}

		this.ctx.restore();
	}

	private smoothPath(points: Point[]): Point[] {
		if (points.length < 3) return points;

		const smoothed: Point[] = [points[0]];

		for (let i = 1; i < points.length - 1; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const next = points[i + 1];

			// Apply smoothing
			const smoothX = curr.x * (1 - this.smoothing) + ((prev.x + next.x) / 2) * this.smoothing;
			const smoothY = curr.y * (1 - this.smoothing) + ((prev.y + next.y) / 2) * this.smoothing;

			smoothed.push({
				x: smoothX,
				y: smoothY,
				pressure: curr.pressure
			});
		}

		smoothed.push(points[points.length - 1]);
		return smoothed;
	}

	private redrawPath(points: Point[], baseWidth: number) {
		// This method redraws the entire path with final smoothing
		// Useful for cleaning up the line after drawing is complete
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = this.width;
		tempCanvas.height = this.height;
		const tempCtx = tempCanvas.getContext('2d')!;

		// Copy current canvas
		tempCtx.drawImage(this.canvas, 0, 0);

		// Clear the area where we drew (approximate)
		const bounds = this.getPathBounds(points);
		const padding = baseWidth;
		this.ctx.clearRect(
			bounds.minX - padding,
			bounds.minY - padding,
			bounds.maxX - bounds.minX + padding * 2,
			bounds.maxY - bounds.minY + padding * 2
		);

		// Restore previous content
		this.ctx.drawImage(tempCanvas, 0, 0);

		// Redraw the smoothed path
		this.drawSmoothLine(points, baseWidth);
	}

	private getPathBounds(points: Point[]) {
		let minX = Infinity,
			minY = Infinity;
		let maxX = -Infinity,
			maxY = -Infinity;

		for (const point of points) {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		}

		return { minX, minY, maxX, maxY };
	}

	private calculateWidth(pressure: number, baseWidth: number): number {
		// Use pressure to vary line width
		const pressureWidth = this.minWidth + (baseWidth - this.minWidth) * pressure;
		return Math.min(Math.max(pressureWidth, this.minWidth), this.maxWidth);
	}

	// Pointer event handlers for pressure support
	private handlePointerDown = (e: PointerEvent) => {
		if (!this.pressureSupported) return;
		e.preventDefault();
		const { x, y } = this.getCoordinates(e);
		this.isDrawing = true;
		this.handleStart(x, y, e.pressure || 1);
	};

	private handlePointerMove = (e: PointerEvent) => {
		if (!this.pressureSupported || !this.isDrawing) return;
		e.preventDefault();
		const { x, y } = this.getCoordinates(e);
		this.handleMove(x, y, e.pressure || 1);
	};

	private handlePointerUp = (e: PointerEvent) => {
		if (!this.pressureSupported || !this.isDrawing) return;
		e.preventDefault();
		this.isDrawing = false;
		this.handleEnd();
	};

	// Brush style methods
	public setBrushStyle(style: 'pencil' | 'marker' | 'airbrush' | 'calligraphy') {
		switch (style) {
			case 'pencil':
				this.smoothing = 0.3;
				this.ctx.globalCompositeOperation = 'source-over';
				break;
			case 'marker':
				this.smoothing = 0.5;
				this.ctx.globalCompositeOperation = 'multiply';
				break;
			case 'airbrush':
				this.smoothing = 0.7;
				this.ctx.globalCompositeOperation = 'source-over';
				// Would need special rendering for airbrush effect
				break;
			case 'calligraphy':
				this.smoothing = 0.4;
				// Would need special angle-based width calculation
				break;
		}
	}
}
