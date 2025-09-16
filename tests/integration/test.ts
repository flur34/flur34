import { expect, test } from '@playwright/test';

const indexPage = 'http://localhost:4173/';

const APP_NAME = process.env.PUBLIC_APP_NAME ?? 'flur34';
const SPONSOR_URL = process.env.PUBLIC_SPONSOR_URL ?? 'https://ko-fi.com/flurbudurbur';
const DISCORD_URL = process.env.PUBLIC_DISCORD_URL ?? 'https://discord.gg/AxUnC7n9ZP';
const SOURCE_CODE_URL = process.env.PUBLIC_SOURCE_URL ?? 'https://github.com/flur34/flur34';

test('index page has expected title', async ({ page }) => {
	await page.goto(indexPage);
	await expect(page).toHaveTitle(APP_NAME + ' - Rule34 Hentai');
});

test('header has expected links', async ({ page }) => {
	await page.goto(indexPage);

	await expect(page.getByTitle('Sponsor')).toHaveAttribute('href', SPONSOR_URL);
	await expect(page.getByTitle('Discord Server')).toHaveAttribute('href', DISCORD_URL);
	await expect(page.getByTitle('Documentation')).toHaveAttribute('href', '/help');
	await expect(page.getByTitle('Search', { exact: true })).toHaveAttribute('href', '/');
	await expect(page.getByTitle('Settings')).toHaveAttribute('href', '/preferences');
	await expect(page.getByTitle('Account')).toHaveAttribute('href', '/account');
});

test('footer has expected links and texts', async ({ page }) => {
	await page.goto(indexPage);

	// Footer links
	const sourceCode = page.getByTitle('Source Code', { exact: true });
	const sourceCodeDocker = page.getByTitle('Source Code Docker', { exact: true });
	const about = page.getByTitle('About');

	await expect(sourceCode).toHaveAttribute('href', 'https://github.com/kurozenzen/kurosearch');
	await expect(sourceCode).toHaveAttribute('target', '_blank');

	await expect(sourceCodeDocker).toHaveAttribute('href', SOURCE_CODE_URL);
	await expect(sourceCodeDocker).toHaveAttribute('target', '_blank');

	await expect(about).toHaveAttribute('href', '/about');

	// Copyright year
	const currentYear = new Date().getFullYear();
	await expect(page.getByText(`© ${currentYear} kurozenzen`)).toBeVisible();

	// Disclaimer text
	await expect(
		page.getByText('I do not own the rights to Helheim Lynx', { exact: false })
	).toBeVisible();
});
