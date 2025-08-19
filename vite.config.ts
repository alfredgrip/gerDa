import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['execa'] // this causes errors in dev server, maybe a future version has fixed it
	},
	server: {
		fs: {
			allow: ['output']
		}
	},
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
