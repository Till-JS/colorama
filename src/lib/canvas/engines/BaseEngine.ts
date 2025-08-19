export abstract class BaseEngine {
	protected canvas: HTMLCanvasElement;
	protected ctx: CanvasRenderingContext2D;
	protected width: number;
	protected height: number;
	protected isDrawing = false;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get 2D context');
		this.ctx = ctx;
		this.width = canvas.width;
		this.height = canvas.height;

		this.setupEventListeners();
	}

	protected abstract setupEventListeners(): void;
	protected abstract handleStart(x: number, y: number): void;
	protected abstract handleMove(x: number, y: number): void;
	protected abstract handleEnd(): void;

	public resize(width: number, height: number) {
		// Save current canvas content
		const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

		// Resize canvas
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;

		// Restore content
		this.ctx.putImageData(imageData, 0, 0);
	}

	public clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	public getImageData(): ImageData {
		return this.ctx.getImageData(0, 0, this.width, this.height);
	}

	public putImageData(imageData: ImageData) {
		this.ctx.putImageData(imageData, 0, 0);
	}

	protected getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = this.canvas.getBoundingClientRect();

		if (event instanceof MouseEvent) {
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		} else {
			const touch = event.touches[0];
			return {
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top
			};
		}
	}

	public destroy() {
		// Clean up event listeners
		this.canvas.removeEventListener('mousedown', this.handleMouseDown);
		this.canvas.removeEventListener('mousemove', this.handleMouseMove);
		this.canvas.removeEventListener('mouseup', this.handleMouseUp);
		this.canvas.removeEventListener('touchstart', this.handleTouchStart);
		this.canvas.removeEventListener('touchmove', this.handleTouchMove);
		this.canvas.removeEventListener('touchend', this.handleTouchEnd);
	}

	protected handleMouseDown = (e: MouseEvent) => {
		const { x, y } = this.getCoordinates(e);
		this.isDrawing = true;
		this.handleStart(x, y);
	};

	protected handleMouseMove = (e: MouseEvent) => {
		if (!this.isDrawing) return;
		const { x, y } = this.getCoordinates(e);
		this.handleMove(x, y);
	};

	protected handleMouseUp = () => {
		if (!this.isDrawing) return;
		this.isDrawing = false;
		this.handleEnd();
	};

	protected handleTouchStart = (e: TouchEvent) => {
		e.preventDefault();
		const { x, y } = this.getCoordinates(e);
		this.isDrawing = true;
		this.handleStart(x, y);
	};

	protected handleTouchMove = (e: TouchEvent) => {
		e.preventDefault();
		if (!this.isDrawing) return;
		const { x, y } = this.getCoordinates(e);
		this.handleMove(x, y);
	};

	protected handleTouchEnd = (e: TouchEvent) => {
		e.preventDefault();
		if (!this.isDrawing) return;
		this.isDrawing = false;
		this.handleEnd();
	};
}
