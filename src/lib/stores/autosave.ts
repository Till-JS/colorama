import { writable, get } from 'svelte/store';
import { projectStore } from './project';
import { ExportUtils } from '$lib/canvas/utils/export';

export interface AutoSaveState {
	enabled: boolean;
	interval: number; // in seconds
	lastSaved: Date | null;
	isSaving: boolean;
}

function createAutoSaveStore() {
	const { subscribe, set, update } = writable<AutoSaveState>({
		enabled: true,
		interval: 30,
		lastSaved: null,
		isSaving: false
	});

	let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
	let canvas: HTMLCanvasElement | null = null;

	function startAutoSave(canvasElement: HTMLCanvasElement) {
		canvas = canvasElement;
		stopAutoSave(); // Clear any existing timer

		const state = get(autoSaveStore);
		if (!state.enabled || !canvas) return;

		autoSaveTimer = setInterval(async () => {
			await save();
		}, state.interval * 1000);
	}

	function stopAutoSave() {
		if (autoSaveTimer) {
			clearInterval(autoSaveTimer);
			autoSaveTimer = null;
		}
	}

	async function save() {
		if (!canvas) return;

		const state = get(autoSaveStore);
		const project = get(projectStore);

		if (!state.enabled || state.isSaving || !project.modified) return;

		update((s) => ({ ...s, isSaving: true }));

		try {
			// Get canvas data
			const canvasData = ExportUtils.getDataURL(canvas);
			const thumbnail = ExportUtils.generateThumbnail(canvas, 200);

			// Save to IndexedDB
			await projectStore.saveProject(canvasData, {
				thumbnail,
				mode: get(projectStore).name,
				timestamp: new Date().toISOString()
			});

			update((s) => ({
				...s,
				lastSaved: new Date(),
				isSaving: false
			}));

			console.log('Auto-saved at', new Date().toLocaleTimeString());
		} catch (error) {
			console.error('Auto-save failed:', error);
			update((s) => ({ ...s, isSaving: false }));
		}
	}

	async function saveNow() {
		await save();
	}

	function setEnabled(enabled: boolean) {
		update((s) => ({ ...s, enabled }));
		if (enabled && canvas) {
			startAutoSave(canvas);
		} else {
			stopAutoSave();
		}
	}

	function setInterval(interval: number) {
		update((s) => ({ ...s, interval }));
		if (canvas) {
			startAutoSave(canvas); // Restart with new interval
		}
	}

	return {
		subscribe,
		startAutoSave,
		stopAutoSave,
		saveNow,
		setEnabled,
		setInterval,
		reset: () =>
			set({
				enabled: true,
				interval: 30,
				lastSaved: null,
				isSaving: false
			})
	};
}

export const autoSaveStore = createAutoSaveStore();
