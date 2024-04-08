import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            manifest: {
                icons: [
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        }),
    ],
    define: {
        "global": 'window'
    },
    build: {
        rollupOptions: {
            input: {
                index: './index.html',
                wezzle_project: './wezzle-project.html',
                preview: './src/wezzle-project/preview/preview.html'
            }
        }
    }
})