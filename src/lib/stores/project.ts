import { writable } from 'svelte/store';
import { db } from '$lib/db/schema';
import type { Project } from '$lib/db/schema';

export interface CurrentProject {
	id: number | null;
	name: string;
	modified: boolean;
	autoSave: boolean;
}

function createProjectStore() {
	const { subscribe, set, update } = writable<CurrentProject>({
		id: null,
		name: 'Untitled',
		modified: false,
		autoSave: true
	});

	return {
		subscribe,
		setProject: (project: Partial<CurrentProject>) => update((state) => ({ ...state, ...project })),
		markModified: () => update((state) => ({ ...state, modified: true })),
		markSaved: () => update((state) => ({ ...state, modified: false })),

		async loadProject(id: number) {
			const project = await db.projects.get(id);
			if (project) {
				set({
					id: project.id!,
					name: project.name,
					modified: false,
					autoSave: true
				});
				return project;
			}
			return null;
		},

		async saveProject(canvasData: string, settings: Record<string, any>) {
			const state = get(projectStore);
			if (state.id) {
				// Update existing project
				await db.projects.update(state.id, {
					modified: new Date()
				});
				await db.projectData.where('projectId').equals(state.id).modify({
					canvasData,
					settings
				});
			} else {
				// Create new project
				const project: Project = {
					name: state.name,
					mode: 'pixel', // Default mode
					created: new Date(),
					modified: new Date()
				};
				const projectId = await db.projects.add(project);
				await db.projectData.add({
					projectId: projectId as number,
					canvasData,
					settings
				});
				update((s) => ({ ...s, id: projectId as number }));
			}
			update((s) => ({ ...s, modified: false }));
		},

		async listProjects() {
			return await db.projects.toArray();
		},

		async deleteProject(id: number) {
			await db.projects.delete(id);
			await db.projectData.where('projectId').equals(id).delete();
		}
	};
}

export const projectStore = createProjectStore();

// Helper to get store value synchronously
function get<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): T {
	let value!: T;
	store.subscribe((v) => (value = v))();
	return value;
}
