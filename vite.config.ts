import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({ 
			project: './project.inlang', 
			outdir: './src/lib/paraglide' 
		}),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Colorama - Creative Canvas',
				short_name: 'Colorama',
				description: 'Your offline-first creative playground',
				theme_color: '#2196f3',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				],
				categories: ['creativity', 'art', 'drawing']
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,woff,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true
			}
		})
	]
});