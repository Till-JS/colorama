import { BaseEngine } from './BaseEngine';
import { get } from 'svelte/store';
import { canvasState } from '$lib/stores/canvas';

interface Point {
	x: number;
	y: number;
}

export class MandalaEngine extends BaseEngine {
	private centerX: number;
	private centerY: number;
	private segments = 8;
	private mirrorMode = true;
	private showGuides = true;
	private guideCanvas: HTMLCanvasElement;
	private guideCtx: CanvasRenderingContext2D;
	private currentPath: Point[] = [];
	private lastPoint: Point | null = null;

	constructor(canvas: HTMLCanvasElement, guideCanvas: HTMLCanvasElement) {
		super(canvas);
		this.guideCanvas = guideCanvas;
		const ctx = guideCanvas.getContext('2d');
		if (!ctx) throw new Error('Could not get guide context');
		this.guideCtx = ctx;

		this.centerX = this.width / 2;
		this.centerY = this.height / 2;

		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';

		this.drawGuides();
	}

	protected setupEventListeners() {
		this.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.canvas.addEventListener('touchstart', this.handleTouchStart);
		this.canvas.addEventListener('touchmove', this.handleTouchMove);
		this.canvas.addEventListener('touchend', this.handleTouchEnd);
		this.canvas.addEventListener('mouseleave', this.handleMouseUp);
	}

	public setSegments(segments: number) {
		this.segments = segments;
		this.drawGuides();
	}

	public setMirrorMode(mirror: boolean) {
		this.mirrorMode = mirror;
		this.drawGuides();
	}

	public toggleGuides() {
		this.showGuides = !this.showGuides;
		if (this.showGuides) {
			this.drawGuides();
		} else {
			this.guideCtx.clearRect(0, 0, this.width, this.height);
		}
	}

	public resize(width: number, height: number) {
		super.resize(width, height);
		this.centerX = width / 2;
		this.centerY = height / 2;
		this.guideCanvas.width = width;
		this.guideCanvas.height = height;
		this.drawGuides();
	}

	private drawGuides() {
		if (!this.showGuides) return;

		this.guideCtx.clearRect(0, 0, this.width, this.height);
		this.guideCtx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
		this.guideCtx.lineWidth = 1;

		// Draw center point
		this.guideCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
		this.guideCtx.beginPath();
		this.guideCtx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
		this.guideCtx.fill();

		// Draw radial guides
		const angleStep = (Math.PI * 2) / this.segments;
		for (let i = 0; i < this.segments; i++) {
			const angle = i * angleStep;
			const endX = this.centerX + Math.cos(angle) * Math.max(this.width, this.height);
			const endY = this.centerY + Math.sin(angle) * Math.max(this.width, this.height);

			this.guideCtx.beginPath();
			this.guideCtx.moveTo(this.centerX, this.centerY);
			this.guideCtx.lineTo(endX, endY);
			this.guideCtx.stroke();
		}

		// Draw circular guides
		const maxRadius = Math.min(this.width, this.height) / 2;
		for (let r = maxRadius / 4; r < maxRadius; r += maxRadius / 4) {
			this.guideCtx.beginPath();
			this.guideCtx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
			this.guideCtx.stroke();
		}
	}

	protected handleStart(x: number, y: number) {
		const state = get(canvasState);
		this.currentPath = [{ x, y }];
		this.lastPoint = { x, y };

		// Set drawing properties
		this.ctx.strokeStyle = state.tool === 'eraser' ? 'white' : state.color;
		this.ctx.globalAlpha = state.opacity;
		this.ctx.lineWidth = state.brushSize;
		this.ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';

		// Draw initial point at all symmetry positions
		this.drawSymmetricPoints(x, y);
	}

	protected handleMove(x: number, y: number) {
		if (!this.isDrawing || !this.lastPoint) return;

		this.currentPath.push({ x, y });

		// Draw lines from last point to current point at all symmetry positions
		this.drawSymmetricLines(this.lastPoint.x, this.lastPoint.y, x, y);

		this.lastPoint = { x, y };
	}

	protected handleEnd() {
		if (this.currentPath.length > 0) {
			// Save to history
			const imageData = this.getImageData();
			canvasState.addToHistory(imageData);
		}

		this.currentPath = [];
		this.lastPoint = null;
		this.ctx.globalAlpha = 1;
		this.ctx.globalCompositeOperation = 'source-over';
	}

	private drawSymmetricPoints(x: number, y: number) {
		const points = this.getSymmetricPoints(x, y);

		for (const point of points) {
			this.ctx.beginPath();
			this.ctx.arc(point.x, point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	private drawSymmetricLines(x1: number, y1: number, x2: number, y2: number) {
		const startPoints = this.getSymmetricPoints(x1, y1);
		const endPoints = this.getSymmetricPoints(x2, y2);

		for (let i = 0; i < startPoints.length; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(startPoints[i].x, startPoints[i].y);
			this.ctx.lineTo(endPoints[i].x, endPoints[i].y);
			this.ctx.stroke();
		}
	}

	private getSymmetricPoints(x: number, y: number): Point[] {
		const points: Point[] = [];
		const angleStep = (Math.PI * 2) / this.segments;

		// Convert to polar coordinates relative to center
		const dx = x - this.centerX;
		const dy = y - this.centerY;
		const radius = Math.sqrt(dx * dx + dy * dy);
		const angle = Math.atan2(dy, dx);

		// Generate points for each segment
		for (let i = 0; i < this.segments; i++) {
			const rotatedAngle = angle + angleStep * i;
			const rotatedX = this.centerX + radius * Math.cos(rotatedAngle);
			const rotatedY = this.centerY + radius * Math.sin(rotatedAngle);
			points.push({ x: rotatedX, y: rotatedY });

			// Add mirrored point if mirror mode is on
			if (this.mirrorMode) {
				const mirrorAngle = -angle + angleStep * i;
				const mirrorX = this.centerX + radius * Math.cos(mirrorAngle);
				const mirrorY = this.centerY + radius * Math.sin(mirrorAngle);
				points.push({ x: mirrorX, y: mirrorY });
			}
		}

		return points;
	}

	// Animation support for rotating mandalas
	private animationFrame: number | null = null;
	private rotationSpeed = 0.01;
	private isAnimating = false;

	public startAnimation() {
		if (this.isAnimating) return;
		this.isAnimating = true;

		const animate = () => {
			if (!this.isAnimating) return;

			// Save current canvas
			const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

			// Clear canvas
			this.ctx.clearRect(0, 0, this.width, this.height);

			// Rotate and redraw
			this.ctx.save();
			this.ctx.translate(this.centerX, this.centerY);
			this.ctx.rotate(this.rotationSpeed);
			this.ctx.translate(-this.centerX, -this.centerY);
			this.ctx.putImageData(imageData, 0, 0);
			this.ctx.restore();

			this.animationFrame = requestAnimationFrame(animate);
		};

		animate();
	}

	public stopAnimation() {
		this.isAnimating = false;
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	public setRotationSpeed(speed: number) {
		this.rotationSpeed = speed;
	}

	// Kaleidoscope effect
	public applyKaleidoscopeEffect() {
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = this.width;
		tempCanvas.height = this.height;
		const tempCtx = tempCanvas.getContext('2d')!;

		// Copy current canvas
		tempCtx.drawImage(this.canvas, 0, 0);

		// Clear main canvas
		this.ctx.clearRect(0, 0, this.width, this.height);

		// Draw kaleidoscope pattern
		const angleStep = (Math.PI * 2) / this.segments;
		for (let i = 0; i < this.segments; i++) {
			this.ctx.save();
			this.ctx.translate(this.centerX, this.centerY);
			this.ctx.rotate(angleStep * i);

			// Clip to wedge shape
			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			this.ctx.arc(0, 0, Math.max(this.width, this.height), 0, angleStep);
			this.ctx.closePath();
			this.ctx.clip();

			// Draw the image
			this.ctx.drawImage(tempCanvas, -this.centerX, -this.centerY);

			// Draw mirrored version
			if (this.mirrorMode) {
				this.ctx.scale(1, -1);
				this.ctx.drawImage(tempCanvas, -this.centerX, -this.centerY);
			}

			this.ctx.restore();
		}

		// Save to history
		const imageData = this.getImageData();
		canvasState.addToHistory(imageData);
	}

	public destroy() {
		super.destroy();
		this.stopAnimation();
	}
}
