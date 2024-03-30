import { defineConfig } from 'vite'

export default defineConfig({
    define: {
        "global": 'window'
    },
    build: {
        rollupOptions: {
            input: {
                index: './index.html',
                preview: './src/preview/preview.html'
            }
        }
    }
})