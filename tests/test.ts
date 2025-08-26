import { expect, test } from '@playwright/test';
import { APP_NAME } from '$lib/logic/app-name';

const indexPage = 'http://localhost:4173/';

test('index page has expected title', async ({ page }) => {
	await page.goto(indexPage);
	await expect(page).toHaveTitle(APP_NAME + ' - Rule34 Hentai');
});
// ... existing code ...
test('header has expected links', async ({ page }) => {
	await page.goto(indexPage);

	await expect(page.getByTitle('Sponsor')).toHaveAttribute('href', 'https://ko-fi.com/kurozenzen');
	await expect(page.getByTitle('Discord Server')).toHaveAttribute(
		'href',
		'https://discord.gg/yyJFG5PVBZ'
	);
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

	await expect(sourceCodeDocker).toHaveAttribute(
		'href',
		'https://github.com/flurbudurbur/kurosearch'
	);
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
// ... existing code ...
// test('adding tag works', async ({ page }) => {
// 	await page.goto(indexPage);

// 	const modifier = page.getByTestId('select-modifier');
// 	const searchbar = page.getByTestId('searchbar');

// 	expect(searchbar.innerText).toBe('');
// });
