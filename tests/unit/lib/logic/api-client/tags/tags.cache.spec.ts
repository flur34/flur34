import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as idb from '$lib/indexeddb/idb';
import { getTagDetails } from '$lib/logic/api-client/tags/tags';

const delay = (ms = 10) => new Promise((r) => setTimeout(r, ms));

// Helper to set window.location.origin deterministically for URL building
const setOrigin = (origin: string) => {
	Object.defineProperty(window, 'location', {
		value: new URL(origin),
		writable: true
	});
};

const originalFetch = global.fetch;

describe('api-client/tags (cache hit path)', () => {
	beforeEach(async () => {
		setOrigin('http://localhost:3000/');
		// Ensure cache path is taken in SUT
		// @ts-ignore
		(window as any).indexedDB = (window as any).indexedDB ?? {};
		// wait for idb module to initialize and then seed
		await delay(20);
		idb.addIndexedTag({ name: 'bird', count: 10, type: 'general' } as any);
		await delay(10);
	});

	afterEach(() => {
		global.fetch = originalFetch as any;
		vi.restoreAllMocks();
		vi.resetModules();
		// @ts-ignore
		delete (window as any).indexedDB;
	});

	it('returns cached tag without calling fetch', async () => {
		const fetchSpy = vi.fn();
		// @ts-ignore
		global.fetch = fetchSpy;

		const res = await getTagDetails('bird', '', '');
		expect(res).toEqual({ name: 'bird', count: 10, type: 'general' });
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
