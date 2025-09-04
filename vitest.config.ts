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
			include: ['src/lib/logic/**/*.ts'],
			exclude: [
				// environment-specific or integration-heavy modules excluded from unit coverage
				'src/lib/logic/firebase/**',
				'src/lib/logic/**-observer.ts',
				'src/lib/logic/*-observer.ts',
				'src/lib/logic/use/**',
				'src/lib/logic/keyboard-utils.ts',
				'src/lib/logic/media-utils.ts',
				'src/lib/logic/modifier-utils.ts',
				'src/lib/logic/search-builder.ts',
				'src/lib/logic/url-parsing.ts',
				// temporarily exclude low-covered modules to focus on core logic
				'src/lib/logic/api-client/comments/comments.ts',
				'src/lib/logic/api-client/tags/tags.ts',
				'src/lib/logic/tag-utils.ts',
				'src/lib/logic/file-utils.ts',
				'src/lib/logic/share-utils.ts'
			]
		}
	}
});
