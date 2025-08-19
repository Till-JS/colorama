<script lang="ts">
	import ModeSelector from '$lib/components/ModeSelector.svelte';
	import { projectStore } from '$lib/stores/project';
	import { onMount } from 'svelte';

	let recentProjects: any[] = [];

	onMount(async () => {
		recentProjects = await projectStore.listProjects();
	});
</script>

<svelte:head>
	<title>Colorama - Creative Canvas</title>
	<meta name="description" content="Your offline-first creative playground" />
</svelte:head>

<div class="home-page">
	<header class="hero">
		<h1>🎨 Colorama</h1>
		<p>Your offline-first creative playground</p>
		<div class="hero-actions">
			<a href="/gallery" class="btn-gallery">📁 My Gallery</a>
		</div>
	</header>

	<ModeSelector />

	{#if recentProjects.length > 0}
		<section class="recent-projects">
			<h2>Recent Projects</h2>
			<div class="project-grid">
				{#each recentProjects as project}
					<button class="project-card">
						{#if project.thumbnail}
							<img src={project.thumbnail} alt={project.name} />
						{:else}
							<div class="project-placeholder">📄</div>
						{/if}
						<h4>{project.name}</h4>
						<p>{project.mode} • {new Date(project.modified).toLocaleDateString()}</p>
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.home-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
	}

	.hero {
		text-align: center;
		color: white;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 3rem;
		margin: 0 0 0.5rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.hero p {
		font-size: 1.25rem;
		opacity: 0.9;
		margin-bottom: 1.5rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-gallery {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.3s;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.btn-gallery:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.recent-projects {
		max-width: 1200px;
		margin: 3rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.recent-projects h2 {
		margin: 0 0 1.5rem 0;
		color: #333;
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
	}

	.project-card {
		background: #f5f5f5;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		transition: transform 0.2s;
		text-align: center;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.project-placeholder {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.project-card img {
		width: 100%;
		height: 100px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.project-card h4 {
		margin: 0.5rem 0 0.25rem 0;
		font-size: 0.875rem;
		color: #333;
	}

	.project-card p {
		margin: 0;
		font-size: 0.75rem;
		color: #666;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2rem;
		}

		.hero p {
			font-size: 1rem;
		}
	}
</style>
