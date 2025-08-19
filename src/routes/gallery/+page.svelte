<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { projectStore } from '$lib/stores/project';
	import { db, type Project } from '$lib/db/schema';
	import { ExportUtils } from '$lib/canvas/utils/export';

	let projects: Project[] = [];
	let loading = true;
	let searchQuery = '';
	let filterMode: 'all' | 'pixel' | 'draw' | 'mandala' = 'all';
	let sortBy: 'modified' | 'created' | 'name' = 'modified';
	let showDeleteConfirm = false;
	let projectToDelete: Project | null = null;

	$: filteredProjects = filterAndSortProjects(projects, searchQuery, filterMode, sortBy);

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		loading = true;
		try {
			projects = await projectStore.listProjects();
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			loading = false;
		}
	}

	function filterAndSortProjects(
		projects: Project[],
		search: string,
		mode: string,
		sort: string
	): Project[] {
		let filtered = [...projects];

		// Filter by search query
		if (search) {
			filtered = filtered.filter((p) =>
				p.name.toLowerCase().includes(search.toLowerCase())
			);
		}

		// Filter by mode
		if (mode !== 'all') {
			filtered = filtered.filter((p) => p.mode === mode);
		}

		// Sort
		filtered.sort((a, b) => {
			switch (sort) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'created':
					return new Date(b.created).getTime() - new Date(a.created).getTime();
				case 'modified':
				default:
					return new Date(b.modified).getTime() - new Date(a.modified).getTime();
			}
		});

		return filtered;
	}

	async function openProject(project: Project) {
		if (!project.id) return;
		await projectStore.loadProject(project.id);
		goto(`/${project.mode}`);
	}

	async function duplicateProject(project: Project) {
		if (!project.id) return;
		
		try {
			// Get project data
			const projectData = await db.projectData.where('projectId').equals(project.id).first();
			if (!projectData) return;

			// Create new project
			const newProject: Project = {
				name: `${project.name} (Copy)`,
				mode: project.mode,
				created: new Date(),
				modified: new Date(),
				thumbnail: project.thumbnail
			};

			const newProjectId = await db.projects.add(newProject);
			
			// Copy project data
			await db.projectData.add({
				projectId: newProjectId as number,
				canvasData: projectData.canvasData,
				settings: projectData.settings
			});

			// Reload projects
			await loadProjects();
		} catch (error) {
			console.error('Failed to duplicate project:', error);
		}
	}

	async function deleteProject(project: Project) {
		if (!project.id) return;
		
		showDeleteConfirm = false;
		projectToDelete = null;
		
		try {
			await projectStore.deleteProject(project.id);
			await loadProjects();
		} catch (error) {
			console.error('Failed to delete project:', error);
		}
	}

	function confirmDelete(project: Project) {
		projectToDelete = project;
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		projectToDelete = null;
		showDeleteConfirm = false;
	}

	function createNewProject(mode: 'pixel' | 'draw' | 'mandala') {
		goto(`/${mode}`);
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Gallery - Colorama</title>
</svelte:head>

<div class="gallery-page">
	<header class="gallery-header">
		<div class="header-content">
			<h1>🎨 My Gallery</h1>
			<div class="header-actions">
				<a href="/" class="btn-home">Home</a>
			</div>
		</div>
		
		<div class="gallery-controls">
			<div class="search-bar">
				<input
					type="text"
					placeholder="Search projects..."
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>
			
			<div class="filters">
				<select bind:value={filterMode} class="filter-select">
					<option value="all">All Modes</option>
					<option value="pixel">Pixel Art</option>
					<option value="draw">Free Draw</option>
					<option value="mandala">Mandala</option>
				</select>
				
				<select bind:value={sortBy} class="filter-select">
					<option value="modified">Last Modified</option>
					<option value="created">Date Created</option>
					<option value="name">Name</option>
				</select>
			</div>
		</div>
	</header>

	<main class="gallery-content">
		{#if loading}
			<div class="loading">Loading projects...</div>
		{:else if filteredProjects.length === 0}
			<div class="empty-state">
				<p>No projects found</p>
				<div class="create-buttons">
					<button on:click={() => createNewProject('pixel')} class="create-btn">
						🟦 New Pixel Art
					</button>
					<button on:click={() => createNewProject('draw')} class="create-btn">
						✏️ New Drawing
					</button>
					<button on:click={() => createNewProject('mandala')} class="create-btn">
						🔮 New Mandala
					</button>
				</div>
			</div>
		{:else}
			<div class="projects-grid">
				<!-- New Project Cards -->
				<button on:click={() => createNewProject('pixel')} class="project-card new-project">
					<div class="new-icon">+</div>
					<h3>New Pixel Art</h3>
				</button>
				<button on:click={() => createNewProject('draw')} class="project-card new-project">
					<div class="new-icon">+</div>
					<h3>New Drawing</h3>
				</button>
				<button on:click={() => createNewProject('mandala')} class="project-card new-project">
					<div class="new-icon">+</div>
					<h3>New Mandala</h3>
				</button>

				<!-- Existing Projects -->
				{#each filteredProjects as project (project.id)}
					<div class="project-card">
						<button class="project-thumbnail" on:click={() => openProject(project)}>
							{#if project.thumbnail}
								<img src={project.thumbnail} alt={project.name} />
							{:else}
								<div class="placeholder">
									{#if project.mode === 'pixel'}
										🟦
									{:else if project.mode === 'draw'}
										✏️
									{:else}
										🔮
									{/if}
								</div>
							{/if}
						</button>
						
						<div class="project-info">
							<h3>{project.name}</h3>
							<p class="project-meta">
								<span class="mode-badge {project.mode}">{project.mode}</span>
								<span class="date">{formatDate(new Date(project.modified))}</span>
							</p>
						</div>
						
						<div class="project-actions">
							<button
								on:click={() => openProject(project)}
								class="action-btn"
								title="Open"
							>
								📂
							</button>
							<button
								on:click={() => duplicateProject(project)}
								class="action-btn"
								title="Duplicate"
							>
								📋
							</button>
							<button
								on:click={() => confirmDelete(project)}
								class="action-btn delete"
								title="Delete"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm && projectToDelete}
	<div class="dialog-overlay" on:click={cancelDelete}>
		<div class="dialog" on:click|stopPropagation>
			<h2>Delete Project?</h2>
			<p>Are you sure you want to delete "{projectToDelete.name}"?</p>
			<p class="warning">This action cannot be undone.</p>
			<div class="dialog-actions">
				<button on:click={cancelDelete} class="btn-cancel">Cancel</button>
				<button on:click={() => deleteProject(projectToDelete)} class="btn-delete">
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.gallery-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.gallery-header {
		background: white;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.gallery-header h1 {
		margin: 0;
		font-size: 2rem;
		color: #333;
	}

	.btn-home {
		padding: 0.5rem 1rem;
		background: #f0f0f0;
		color: #333;
		text-decoration: none;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.btn-home:hover {
		background: #e0e0e0;
	}

	.gallery-controls {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.search-bar {
		flex: 1;
		min-width: 200px;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
	}

	.filter-select {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: white;
		font-size: 1rem;
		cursor: pointer;
	}

	.gallery-content {
		padding: 2rem;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 4rem;
		color: white;
		font-size: 1.25rem;
	}

	.create-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.create-btn {
		padding: 1rem 2rem;
		background: white;
		color: #333;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.create-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.project-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.project-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	.project-card.new-project {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 280px;
		border: 2px dashed #ddd;
		cursor: pointer;
		transition: all 0.2s;
	}

	.project-card.new-project:hover {
		border-color: #2196f3;
		background: #f8f9fa;
	}

	.new-icon {
		font-size: 3rem;
		color: #999;
		margin-bottom: 0.5rem;
	}

	.project-card.new-project h3 {
		margin: 0;
		color: #666;
		font-size: 1rem;
	}

	.project-thumbnail {
		display: block;
		width: 100%;
		height: 180px;
		background: #f5f5f5;
		border: none;
		cursor: pointer;
		overflow: hidden;
		position: relative;
	}

	.project-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-size: 4rem;
		background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
	}

	.project-info {
		padding: 1rem;
	}

	.project-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #333;
	}

	.project-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: #666;
	}

	.mode-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.mode-badge.pixel {
		background: #e3f2fd;
		color: #1976d2;
	}

	.mode-badge.draw {
		background: #fce4ec;
		color: #c2185b;
	}

	.mode-badge.mandala {
		background: #f3e5f5;
		color: #7b1fa2;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem 1rem;
	}

	.action-btn {
		flex: 1;
		padding: 0.5rem;
		background: #f5f5f5;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 1.25rem;
	}

	.action-btn:hover {
		background: #e0e0e0;
	}

	.action-btn.delete:hover {
		background: #ffebee;
	}

	/* Delete Dialog */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.dialog h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.dialog p {
		margin: 0.5rem 0;
		color: #666;
	}

	.warning {
		color: #d32f2f;
		font-weight: 500;
	}

	.dialog-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.btn-cancel,
	.btn-delete {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-cancel {
		background: #f5f5f5;
		color: #333;
	}

	.btn-cancel:hover {
		background: #e0e0e0;
	}

	.btn-delete {
		background: #f44336;
		color: white;
	}

	.btn-delete:hover {
		background: #d32f2f;
	}

	@media (max-width: 768px) {
		.projects-grid {
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
			gap: 1rem;
		}

		.gallery-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.filters {
			width: 100%;
		}

		.filter-select {
			flex: 1;
		}
	}
</style>