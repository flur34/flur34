import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTagSuggestions, getTagDetails } from '$lib/logic/api-client/tags/tags';
import { mockFetch, makeResponse } from '../../../../../setup/mocks/fetch';

describe('api-client/tags (window undefined paths)', () => {
	let savedWindow: any;

	beforeEach(() => {
		// Remove window so URL builder uses localhost origin
		savedWindow = (global as any).window;
		// @ts-ignore
		delete (global as any).window;
	});

	afterEach(() => {
		// restore window
		(global as any).window = savedWindow;
	});

	it('getTagDetails uses localhost origin when window is undefined', async () => {
		const xml = '<tags count="1"><tag name="anon" count="1" type="0" /></tags>';
		const fetchSpy = mockFetch(async (input) => {
			const url = new URL(input as string);
			expect(url.origin).toBe('http://localhost');
			expect(url.searchParams.get('name')).toBe('anon');
			return makeResponse({ text: xml });
		});

		const out = await getTagDetails('anon', '', '');
		expect(out).toEqual({ name: 'anon', count: 1, type: 'general' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('getTagSuggestions uses localhost origin when window is undefined', async () => {
		const payload = [{ value: 'tag_one', label: 'tag_one (123)' }];
		const fetchSpy = mockFetch(async (input) => {
			const url = new URL(input as string);
			expect(url.origin).toBe('http://localhost');
			expect(url.searchParams.get('autocomplete')).toBe('1');
			expect(url.searchParams.get('q')).toBe('tag_one');
			return makeResponse({ json: payload });
		});

		const suggestions = await getTagSuggestions('tag one');
		expect(suggestions).toEqual([{ label: 'tag_one', count: 123, type: 'tag' }]);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
