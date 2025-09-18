import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run dev',
		port: 5173,
		timeout: 120 * 1000,
		/* @ts-expect-error: Process var outside Node.js */
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests/integration',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		headless: true,
		viewport: { width: 1280, height: 720 }
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				launchOptions: {
					args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
				}
			}
		}
	],
	timeout: 60 * 1000,
	expect: {
		timeout: 30 * 1000
	}
});
