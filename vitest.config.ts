import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser']
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['tests/unit/**/*.{test,spec}.{ts,js}'],
		setupFiles: ['tests/setup/setup.ts'],
		coverage: {
			reporter: ['json-summary', 'text'],
			include: ['test/unit/**/*.ts'],
			exclude: ['src/**/*.d.ts']
		},
		testTimeout: 10000
	}
});
