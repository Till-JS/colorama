import { writable } from 'svelte/store';

export type DrawingMode = 'pixel' | 'draw' | 'mandala';
export type Tool = 'brush' | 'eraser' | 'colorPicker' | 'fill' | 'line' | 'rectangle' | 'circle';

export interface CanvasState {
	mode: DrawingMode;
	tool: Tool;
	color: string;
	brushSize: number;
	opacity: number;
	gridEnabled: boolean;
	gridSize: number;
	symmetrySegments: number; // For mandala mode
	history: ImageData[];
	historyStep: number;
}

function createCanvasStore() {
	const { subscribe, set, update } = writable<CanvasState>({
		mode: 'pixel',
		tool: 'brush',
		color: '#000000',
		brushSize: 5,
		opacity: 1,
		gridEnabled: true,
		gridSize: 16,
		symmetrySegments: 8,
		history: [],
		historyStep: -1
	});

	return {
		subscribe,
		setMode: (mode: DrawingMode) => update(state => ({ ...state, mode })),
		setTool: (tool: Tool) => update(state => ({ ...state, tool })),
		setColor: (color: string) => update(state => ({ ...state, color })),
		setBrushSize: (brushSize: number) => update(state => ({ ...state, brushSize })),
		setOpacity: (opacity: number) => update(state => ({ ...state, opacity })),
		toggleGrid: () => update(state => ({ ...state, gridEnabled: !state.gridEnabled })),
		setGridSize: (gridSize: number) => update(state => ({ ...state, gridSize })),
		setSymmetrySegments: (segments: number) => update(state => ({ ...state, symmetrySegments: segments })),
		addToHistory: (imageData: ImageData) => update(state => {
			const newHistory = state.history.slice(0, state.historyStep + 1);
			newHistory.push(imageData);
			// Keep only last 50 states
			if (newHistory.length > 50) {
				newHistory.shift();
			}
			return {
				...state,
				history: newHistory,
				historyStep: newHistory.length - 1
			};
		}),
		undo: () => update(state => ({
			...state,
			historyStep: Math.max(0, state.historyStep - 1)
		})),
		redo: () => update(state => ({
			...state,
			historyStep: Math.min(state.history.length - 1, state.historyStep + 1)
		})),
		reset: () => set({
			mode: 'pixel',
			tool: 'brush',
			color: '#000000',
			brushSize: 5,
			opacity: 1,
			gridEnabled: true,
			gridSize: 16,
			symmetrySegments: 8,
			history: [],
			historyStep: -1
		})
	};
}

export const canvasState = createCanvasStore();