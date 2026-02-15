import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		experimental: { remoteFunctions: true },
		csrf: {
			trustedOrigins: ['*']
		}
	},
	optimizeDeps: {
		exclude: ['output']
	}
};

export default config;
