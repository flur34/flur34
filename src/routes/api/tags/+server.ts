import type { RequestHandler } from '@sveltejs/kit';
import { R34_API_URL } from '$lib/logic/api-client/url';
import { RULE34_API_KEY, RULE34_API_USER } from '$env/static/private';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const isAutocomplete = url.searchParams.has('autocomplete');
	if (isAutocomplete) {
		// Proxy to autocomplete endpoint (JSON)
		const q = url.searchParams.get('q') ?? '';
		const upstream = await fetch(`${R34_API_URL}/autocomplete.php?q=${encodeURIComponent(q)}`);
		return new Response(upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: {
				'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
				'cache-control': upstream.headers.get('cache-control') ?? 'no-store'
			}
		});
	}

	// Tag details via dapi (XML)
	const params = new URLSearchParams({
		page: 'dapi',
		s: 'tag',
		q: 'index',
		limit: '1'
	});

	const name = url.searchParams.get('name');

	const api_key = url.searchParams.get('api_key') ?? RULE34_API_KEY;
	const user_id = url.searchParams.get('user_id') ?? RULE34_API_USER;

	if (name) params.append('name', name);

	if (api_key) params.append('api_key', api_key);
	if (user_id) params.append('user_id', user_id);

	const upstream = await fetch(`${R34_API_URL}?${params.toString()}`);

	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: {
			'content-type': upstream.headers.get('content-type') ?? 'text/xml; charset=utf-8',
			'cache-control': upstream.headers.get('cache-control') ?? 'no-store'
		}
	});
};
