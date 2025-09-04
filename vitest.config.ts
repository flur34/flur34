import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit() as any],
	resolve: {
		conditions: ['browser']
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['src/test/setup.ts'],
		coverage: {
			reporter: ['json-summary', 'text'],
			include: ['src/lib/**/*.ts'],
			exclude: ['src/**/*.d.ts']
		}
	}
});
