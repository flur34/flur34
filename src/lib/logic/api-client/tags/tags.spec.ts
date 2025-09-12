import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTagSuggestions, getTagDetails } from './tags';
import { mockFetch, makeResponse } from '../../../../test/mocks/fetch';

// Helper to set window.location.origin deterministically for URL building
const setOrigin = (origin: string) => {
	Object.defineProperty(window, 'location', {
		value: new URL(origin),
		writable: true
	});
};

// Reset globals between tests
const originalFetch = global.fetch;

describe('api-client/tags', () => {
	beforeEach(() => {
		setOrigin('http://localhost:3000/');
	});

	afterEach(() => {
		global.fetch = originalFetch as any;
		vi.resetModules();
		vi.restoreAllMocks();
		// cleanup potential window.indexedDB flag
		// @ts-ignore
		delete (window as any).indexedDB;
	});

	describe('getTagSuggestions', () => {
		it('maps array responses into suggestions', async () => {
			const payload = [
				{ value: 'tag_one', label: 'tag_one (123)' },
				{ value: 'tag&amp;two', label: 'tag&amp;two (2)' }
			];
			mockFetch(async () => makeResponse({ json: payload }));

			const res = await getTagSuggestions('tag');
			expect(res).toEqual([
				{ label: 'tag_one', count: 123, type: 'tag' },
				{ label: 'tag&amp;two', count: 2, type: 'tag' }
			]);
		});

		it('throws when array is empty', async () => {
			mockFetch(async () => makeResponse({ json: [] }));
			await expect(getTagSuggestions('x')).rejects.toThrow('No tags found');
		});

		it('throws upstream message object', async () => {
			mockFetch(async () => makeResponse({ json: { message: 'rate limited' } }));
			await expect(getTagSuggestions('x')).rejects.toThrow('rate limited');
		});

		it('throws on invalid JSON shape', async () => {
			mockFetch(async () => makeResponse({ json: { not: 'array' } }));
			await expect(getTagSuggestions('x')).rejects.toThrow('Invalid tag suggestions received');
		});

		it('throws on non-OK response', async () => {
			mockFetch(async () => new Response('nope', { status: 500 }));
			await expect(getTagSuggestions('x')).rejects.toThrow('Failed to get tag suggestions');
		});
	});

	describe('getTagDetails', () => {
		it('returns undefined when no tag in xml', async () => {
			mockFetch(async () => makeResponse({ text: '<tags count="0"></tags>' }));
			const tag = await getTagDetails('missing', '', '');
			expect(tag).toBeUndefined();
		});

		it('parses xml and maps types and entities', async () => {
			const xml = '<tags count="1"><tag name="caf&amp;eacute;" count="42" type="1" /></tags>';
			mockFetch(async () => makeResponse({ text: xml }));
			const tag = await getTagDetails('cafe', '', '');
			expect(tag).toEqual({ name: 'café', count: 42, type: 'artist' });
		});
	});
});

describe('getTagDetails (auth and cache branches)', () => {
	it('appends api_key and user_id to request URL when both are provided', async () => {
		const xml = '<tags count="1"><tag name="bird" count="10" type="0" /></tags>';
		const fetchSpy = mockFetch(async (input) => {
			const url = new URL(input as string);
			expect(url.searchParams.get('name')).toBe('bird');
			expect(url.searchParams.get('api_key')).toBe('KEY');
			expect(url.searchParams.get('user_id')).toBe('USER');
			return makeResponse({ text: xml });
		});

		const tag = await getTagDetails('bird', 'KEY', 'USER');
		expect(tag).toEqual({ name: 'bird', count: 10, type: 'general' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('ignores cache READ errors and proceeds to fetch', async () => {
		// Simulate browser indexedDB presence
		// @ts-ignore
		(window as any).indexedDB = {};

		// Mock idb where getIndexedTag throws
		vi.mock('$lib/indexeddb/idb', () => ({
			getIndexedTag: () => {
				throw new Error('read fail');
			}
		}));

		const xml = '<tags count="1"><tag name="lion" count="5" type="0" /></tags>';
		const fetchSpy = mockFetch(async () => makeResponse({ text: xml }));

		const tag = await getTagDetails('lion', '', '');
		expect(tag).toEqual({ name: 'lion', count: 5, type: 'general' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('ignores cache WRITE errors after successful fetch', async () => {
		// Simulate browser indexedDB presence
		// @ts-ignore
		(window as any).indexedDB = {};

		// Mock idb where addIndexedTag throws
		vi.mock('$lib/indexeddb/idb', () => ({
			getIndexedTag: async () => undefined,
			addIndexedTag: () => {
				throw new Error('write fail');
			}
		}));

		const xml = '<tags count="1"><tag name="tiger" count="3" type="0" /></tags>';
		const fetchSpy = mockFetch(async () => makeResponse({ text: xml }));

		const tag = await getTagDetails('tiger', '', '');
		expect(tag).toEqual({ name: 'tiger', count: 3, type: 'general' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('returns undefined when tag element is present but missing required attributes', async () => {
		const xml = '<tags count="1"><tag count="1" type="0" /></tags>'; // missing name
		mockFetch(async () => makeResponse({ text: xml }));
		const tag = await getTagDetails('whatever', '', '');
		expect(tag).toBeUndefined();
	});
});
