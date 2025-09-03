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

		it('uses IndexedDB cache when available', async () => {
			// Simulate browser indexedDB presence
			// @ts-ignore
			(window as any).indexedDB = {};

			// Mock the idb module with our in-memory mock
			vi.mock('$lib/indexeddb/idb', async () => {
				const mod = await import('../../../../test/mocks/indexeddb');
				return mod as any;
			});

			const xml = '<tags count="1"><tag name="bird" count="10" type="0" /></tags>';
			const fetchSpy = mockFetch(async () => makeResponse({ text: xml }));

			// First call: will fetch and then cache
			const t1 = await getTagDetails('bird', '', '');
			expect(t1).toEqual({ name: 'bird', count: 10, type: 'general' });
			expect(fetchSpy).toHaveBeenCalledTimes(1);

			// Second call: should hit cache and not call fetch again
			const t2 = await getTagDetails('bird', '', '');
			expect(t2).toEqual({ name: 'bird', count: 10, type: 'general' });
			expect(fetchSpy).toHaveBeenCalledTimes(1);
		});
	});
});
