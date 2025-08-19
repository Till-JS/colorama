import Dexie, { type Table } from 'dexie';

export interface Project {
	id?: number;
	name: string;
	mode: 'pixel' | 'draw' | 'mandala';
	created: Date;
	modified: Date;
	thumbnail?: string;
}

export interface ProjectData {
	id?: number;
	projectId: number;
	canvasData: string; // Base64 or ImageData
	settings: Record<string, any>;
}

export interface Preference {
	key: string;
	value: any;
}

export interface SyncQueueItem {
	id?: number;
	action: 'create' | 'update' | 'delete';
	data: any;
	synced: boolean;
}

class CreativeCanvasDB extends Dexie {
	projects!: Table<Project>;
	projectData!: Table<ProjectData>;
	preferences!: Table<Preference>;
	syncQueue!: Table<SyncQueueItem>;

	constructor() {
		super('CreativeCanvas');
		this.version(1).stores({
			projects: '++id, name, mode, created, modified',
			projectData: '++id, projectId',
			preferences: 'key',
			syncQueue: '++id, synced'
		});
	}
}

export const db = new CreativeCanvasDB();
