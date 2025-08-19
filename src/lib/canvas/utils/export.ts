export class ExportUtils {
	/**
	 * Export canvas as PNG
	 */
	static async exportAsPNG(canvas: HTMLCanvasElement, filename = 'artwork.png') {
		return new Promise<void>((resolve) => {
			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = filename;
				link.click();
				URL.revokeObjectURL(url);
				resolve();
			}, 'image/png');
		});
	}

	/**
	 * Export canvas as JPEG
	 */
	static async exportAsJPEG(canvas: HTMLCanvasElement, filename = 'artwork.jpg', quality = 0.9) {
		return new Promise<void>((resolve) => {
			// Create a white background canvas for JPEG
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;
			const tempCtx = tempCanvas.getContext('2d')!;

			// Fill white background
			tempCtx.fillStyle = 'white';
			tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

			// Draw original canvas on top
			tempCtx.drawImage(canvas, 0, 0);

			tempCanvas.toBlob(
				(blob) => {
					if (!blob) return;
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = filename;
					link.click();
					URL.revokeObjectURL(url);
					resolve();
				},
				'image/jpeg',
				quality
			);
		});
	}

	/**
	 * Export canvas as SVG (converts raster to SVG image element)
	 */
	static async exportAsSVG(canvas: HTMLCanvasElement, filename = 'artwork.svg') {
		const dataUrl = canvas.toDataURL('image/png');
		const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvas.width}" 
     height="${canvas.height}"
     viewBox="0 0 ${canvas.width} ${canvas.height}">
	<image x="0" y="0" 
	       width="${canvas.width}" 
	       height="${canvas.height}" 
	       xlink:href="${dataUrl}"/>
</svg>`;

		const blob = new Blob([svgContent], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	/**
	 * Export as GIF animation (requires multiple frames)
	 */
	static async exportAsGIF(
		frames: ImageData[],
		width: number,
		height: number,
		filename = 'animation.gif',
		delay = 100
	) {
		// This would require a GIF encoder library like gif.js
		// For now, we'll just export the first frame as PNG
		console.warn('GIF export not yet implemented, exporting first frame as PNG');

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d')!;

		if (frames.length > 0) {
			ctx.putImageData(frames[0], 0, 0);
			await this.exportAsPNG(canvas, filename.replace('.gif', '.png'));
		}
	}

	/**
	 * Export canvas as base64 data URL
	 */
	static getDataURL(canvas: HTMLCanvasElement, type = 'image/png', quality = 1): string {
		return canvas.toDataURL(type, quality);
	}

	/**
	 * Get canvas as Blob
	 */
	static async getBlob(
		canvas: HTMLCanvasElement,
		type = 'image/png',
		quality = 1
	): Promise<Blob | null> {
		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), type, quality);
		});
	}

	/**
	 * Copy canvas to clipboard
	 */
	static async copyToClipboard(canvas: HTMLCanvasElement) {
		try {
			const blob = await this.getBlob(canvas);
			if (!blob) throw new Error('Failed to create blob');

			if ('ClipboardItem' in window) {
				const item = new ClipboardItem({ 'image/png': blob });
				await navigator.clipboard.write([item]);
				return true;
			} else {
				console.warn('Clipboard API not supported');
				return false;
			}
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			return false;
		}
	}

	/**
	 * Generate thumbnail from canvas
	 */
	static generateThumbnail(canvas: HTMLCanvasElement, maxSize = 200): string {
		const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
		const width = canvas.width * scale;
		const height = canvas.height * scale;

		const thumbnailCanvas = document.createElement('canvas');
		thumbnailCanvas.width = width;
		thumbnailCanvas.height = height;
		const ctx = thumbnailCanvas.getContext('2d')!;

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(canvas, 0, 0, width, height);

		return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
	}

	/**
	 * Export project data as JSON
	 */
	static exportProjectData(projectData: any, filename = 'project.json') {
		const json = JSON.stringify(projectData, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	/**
	 * Import project data from JSON file
	 */
	static async importProjectData(): Promise<any> {
		return new Promise((resolve, reject) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json,application/json';

			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) {
					reject('No file selected');
					return;
				}

				try {
					const text = await file.text();
					const data = JSON.parse(text);
					resolve(data);
				} catch (error) {
					reject(error);
				}
			};

			input.click();
		});
	}

	/**
	 * Load image from file
	 */
	static async loadImageFromFile(): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';

			input.onchange = (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) {
					reject('No file selected');
					return;
				}

				const reader = new FileReader();
				reader.onload = (event) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = () => reject('Failed to load image');
					img.src = event.target?.result as string;
				};
				reader.readAsDataURL(file);
			};

			input.click();
		});
	}
}
