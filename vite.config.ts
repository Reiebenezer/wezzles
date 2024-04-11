import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    optimizeDeps: {
        include: [
            "@fontsource-variable/grandstander",
            "@phosphor-icons/web/regular"
        ]
    },
    plugins: [
        VitePWA({
            manifest: {
                name: 'Wezzles',
                description: 'Web development, without the code.',
                icons: [
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
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
                project: './project.html',
                preview: './src/wezzle-project/preview/preview.html'
            }
        }
    }
})