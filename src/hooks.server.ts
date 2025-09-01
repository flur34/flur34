import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const REQUIRED_HEADER_NAME = 'x-requested-by';
const REQUIRED_HEADER_VALUE = 'frontend';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;

	// Consider both "/api" and "/api/..."
	if (path.startsWith('/api')) {
		const req = event.request;

		// Allow preflight and HEAD to pass through
		if (req.method === 'OPTIONS' || req.method === 'HEAD') {
			return resolve(event);
		}

		const secFetchDest = req.headers.get('sec-fetch-dest');
		if (secFetchDest === 'document') {
			return new Response('Forbidden', { status: 403 });
		}

		const secFetchSite = req.headers.get('sec-fetch-site');
		const hasFetchMetadata = secFetchSite !== null;
		const isSameOrigin = secFetchSite === 'same-origin';

		const xSKLoad = req.headers.get('x-sveltekit-load') === '1';
		const hasTrustedMarker = req.headers.get(REQUIRED_HEADER_NAME) === REQUIRED_HEADER_VALUE;

		const origin = req.headers.get('origin');
		const expectedOrigin = (env.FRONTEND_ORIGIN ?? event.url.origin).replace(/\/$/, '');

		const referer = req.headers.get('referer') ?? '';
		const originOk = !origin || origin.replace(/\/$/, '') === expectedOrigin;
		const refererOk =
			!referer ||
			referer === `${expectedOrigin}/` ||
			referer.startsWith(`${expectedOrigin}/`);

		const allowed =
			xSKLoad ||
			(hasFetchMetadata && isSameOrigin && originOk && refererOk) ||
			(originOk && hasTrustedMarker);

		if (!allowed) {
			return new Response('Forbidden', { status: 403 });
		}
	}

	return resolve(event);
};