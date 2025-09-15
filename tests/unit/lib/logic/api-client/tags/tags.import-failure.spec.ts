import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Force the dynamic import of idb module to fail to exercise the catch branch
vi.mock('$lib/indexeddb/idb', () => {
	throw new Error('idb import failed');
});

import { getTagDetails } from '$lib/logic/api-client/tags/tags';
import { mockFetch, makeResponse } from '../../../../../setup/mocks/fetch';

// Helper to set window.location.origin deterministically for URL building
const setOrigin = (origin: string) => {
	Object.defineProperty(window, 'location', {
		value: new URL(origin),
		writable: true
	});
};

const originalFetch = global.fetch;

describe('api-client/tags (idb import failure path)', () => {
	beforeEach(() => {
		setOrigin('http://localhost:3000/');
		// Simulate browser indexedDB presence to enter the try/catch block
		// @ts-ignore
		(window as any).indexedDB = {};
	});

	afterEach(() => {
		global.fetch = originalFetch as any;
		vi.restoreAllMocks();
		vi.resetModules();
		// @ts-ignore
		delete (window as any).indexedDB;
	});

	it('falls back to network when idb module import fails', async () => {
		const xml = '<tags count="1"><tag name="wolf" count="7" type="0" /></tags>';
		const fetchSpy = mockFetch(async () => makeResponse({ text: xml }));

		const out = await getTagDetails('wolf', '', '');
		expect(out).toEqual({ name: 'wolf', count: 7, type: 'general' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
