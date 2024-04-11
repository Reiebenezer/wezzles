import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	optimizeDeps: {
		include: [
			'@fontsource-variable/grandstander',
			'@phosphor-icons/web/regular',
		],
	},
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Wezzles',
				description: 'Web development, without the code.',
				icons: [
					{
						src: '/logo.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
                theme_color: 'white'
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,woff,ttf,woff2,svg}'],
                maximumFileSizeToCacheInBytes: 3670016
			},
		}),
	],
	define: {
		global: 'window',
	},
	build: {
		rollupOptions: {
			input: {
				index: './index.html',
				project: './project.html',
				preview: './src/wezzle-project/preview/preview.html',
			},
		},
	},
})