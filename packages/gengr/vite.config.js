import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.js',
            name: 'GengrExplorer',
            formats: ['es', 'umd'],
            fileName: (format) => (format === 'es' ? 'gengr.es.js' : 'gengr.umd.cjs')
        }
    }
});
