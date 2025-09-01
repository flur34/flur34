import { type RequestHandler } from '@sveltejs/kit';
import { R34_API_URL } from '$lib/logic/api-client/url';
import { RULE34_API_KEY, RULE34_API_USER } from '$env/static/private';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const params = new URLSearchParams({
		page: 'dapi',
		s: 'post',
		q: 'index'
	});

	const fields = url.searchParams.get('fields');
	const limit = url.searchParams.get('limit');
	const pid = url.searchParams.get('pid');
	const id = url.searchParams.get('id');
	const tags = url.searchParams.get('tags');

	const api_key = url.searchParams.get('api_key') ?? RULE34_API_KEY;
	const user_id = url.searchParams.get('user_id') ?? RULE34_API_USER;

	if (fields) params.append('fields', fields);
	if (limit) params.append('limit', limit);
	if (pid) params.append('pid', pid);
	if (id) params.append('id', id);
	if (tags) params.append('tags', tags);

	if (api_key) params.append('api_key', api_key);
	if (user_id) params.append('user_id', user_id);

	// If this is NOT a count request (limit=0), request JSON
	const isCount = limit === '0';
	if (!isCount) {
		params.append('json', '1');
	}

	const upstream = await fetch(`${R34_API_URL}?${params.toString()}`);

	// Pass through the upstream response with a sane content-type
	const contentType =
		upstream.headers.get('content-type') ||
		(isCount ? 'text/xml; charset=utf-8' : 'application/json; charset=utf-8');

	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: {
			'content-type': contentType,
			// Avoid content-encoding surprises on some hosts
			'cache-control': upstream.headers.get('cache-control') ?? 'no-store'
		}
	});
};
