import { canvasState } from '$lib/stores/canvas';
import type { Tool } from '$lib/stores/canvas';

export interface KeyboardShortcut {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	description: string;
	action: () => void;
}

export const shortcuts: KeyboardShortcut[] = [
	// Tool shortcuts
	{
		key: 'b',
		description: 'Brush tool',
		action: () => canvasState.setTool('brush')
	},
	{
		key: 'e',
		description: 'Eraser tool',
		action: () => canvasState.setTool('eraser')
	},
	{
		key: 'f',
		description: 'Fill tool',
		action: () => canvasState.setTool('fill')
	},
	{
		key: 'l',
		description: 'Line tool',
		action: () => canvasState.setTool('line')
	},
	{
		key: 'r',
		description: 'Rectangle tool',
		action: () => canvasState.setTool('rectangle')
	},
	{
		key: 'c',
		description: 'Circle tool',
		action: () => canvasState.setTool('circle')
	},
	{
		key: 'i',
		description: 'Color picker',
		action: () => canvasState.setTool('colorPicker')
	},
	
	// Grid shortcuts (Pixel mode)
	{
		key: 'g',
		description: 'Toggle grid',
		action: () => canvasState.toggleGrid()
	},
	
	// Brush size shortcuts
	{
		key: '1',
		description: 'Brush size 1',
		action: () => canvasState.setBrushSize(1)
	},
	{
		key: '2',
		description: 'Brush size 3',
		action: () => canvasState.setBrushSize(3)
	},
	{
		key: '3',
		description: 'Brush size 5',
		action: () => canvasState.setBrushSize(5)
	},
	{
		key: '4',
		description: 'Brush size 10',
		action: () => canvasState.setBrushSize(10)
	},
	{
		key: '5',
		description: 'Brush size 20',
		action: () => canvasState.setBrushSize(20)
	},
	
	// Increase/Decrease brush size
	{
		key: '[',
		description: 'Decrease brush size',
		action: () => {
			const state = canvasState;
			state.subscribe(s => {
				canvasState.setBrushSize(Math.max(1, s.brushSize - 1));
			})();
		}
	},
	{
		key: ']',
		description: 'Increase brush size',
		action: () => {
			const state = canvasState;
			state.subscribe(s => {
				canvasState.setBrushSize(Math.min(50, s.brushSize + 1));
			})();
		}
	},
	
	// Opacity shortcuts
	{
		key: '0',
		description: 'Full opacity',
		action: () => canvasState.setOpacity(1)
	},
	{
		key: '9',
		description: '90% opacity',
		action: () => canvasState.setOpacity(0.9)
	},
	{
		key: '8',
		description: '80% opacity',
		action: () => canvasState.setOpacity(0.8)
	},
	{
		key: '7',
		description: '70% opacity',
		action: () => canvasState.setOpacity(0.7)
	},
	{
		key: '6',
		description: '60% opacity',
		action: () => canvasState.setOpacity(0.6)
	}
];

export function handleKeyboardShortcut(event: KeyboardEvent): boolean {
	// Don't trigger shortcuts when typing in input fields
	if (event.target instanceof HTMLInputElement || 
		event.target instanceof HTMLTextAreaElement) {
		return false;
	}
	
	// Check for matching shortcut
	const shortcut = shortcuts.find(s => {
		const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
		const ctrlMatch = s.ctrl === undefined || s.ctrl === (event.ctrlKey || event.metaKey);
		const shiftMatch = s.shift === undefined || s.shift === event.shiftKey;
		const altMatch = s.alt === undefined || s.alt === event.altKey;
		
		return keyMatch && ctrlMatch && shiftMatch && altMatch;
	});
	
	if (shortcut) {
		event.preventDefault();
		shortcut.action();
		return true;
	}
	
	return false;
}

// Helper to get current canvas state value
function getCanvasState() {
	let state: any;
	canvasState.subscribe(s => state = s)();
	return state;
}