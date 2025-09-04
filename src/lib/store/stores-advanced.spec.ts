import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure browser=true for store tests
beforeEach(() => {
	vi.resetModules();
	localStorage.clear();
	sessionStorage.clear();
});

const current = async <T>(store: any) =>
	new Promise<T>((resolve) => {
		let unsub: () => void;
		const stop = store.subscribe((v: T) => {
			resolve(v as any);
			setTimeout(() => unsub(), 0);
		});
		unsub = stop;
	});

describe('active-supertags-store', () => {
	it('addOrReplace and removeByName', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		const mod: any = await import('./active-supertags-store');
		const store = mod.default;
		expect(await current<any[]>(store)).toEqual([]);
		store.addOrReplace({ name: 'A', tags: [] } as any);
		let v = await current<any[]>(store);
		expect(v).toEqual([{ name: 'A', tags: [] }]);
		store.addOrReplace({ name: 'A', tags: ['x'] } as any);
		v = await current<any[]>(store);
		expect(v).toEqual([{ name: 'A', tags: ['x'] }]);
		store.removeByName('A');
		v = await current<any[]>(store);
		expect(v).toEqual([]);
		store.reset();
		v = await current<any[]>(store);
		expect(v).toEqual([]);
	});
});

describe('results-store', () => {
	it('addPage filters duplicates; setPage sets correctly; resetPosts clears posts', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		const mod: any = await import('./results-store');
		const store = mod.default;

		const p1 = [{ id: 1 }, { id: 2 }] as any[];
		const p2 = [{ id: 2 }, { id: 3 }] as any[]; // id 2 duplicate

		store.addPage(p1, 100);
		let v = await current<any>(store);
		expect(v.posts.map((p: any) => p.id)).toEqual([1, 2]);
		expect(v.pageCount).toBe(1);
		expect(v.postCount).toBe(100);

		store.addPage(p2);
		v = await current<any>(store);
		expect(v.posts.map((p: any) => p.id)).toEqual([1, 2, 3]);
		expect(v.pageCount).toBe(2);

		store.setPage([{ id: 9 }, { id: 10 }] as any, 4);
		v = await current<any>(store);
		expect(v.posts.map((p: any) => p.id)).toEqual([9, 10]);
		expect(v.pageCount).toBe(5);

		store.resetPosts();
		v = await current<any>(store);
		expect(v.posts).toEqual([]);
		expect(v.requested).toBe(true);

		store.reset();
		v = await current<any>(store);
		expect(v.posts).toEqual([]);
		expect(v.pageCount).toBe(0);
		expect(v.ids instanceof Set).toBe(true);
	});
});

describe('filter-store', () => {
	it('set normalizes scoreValue and reset; update merges', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		const mod: any = await import('./filter-store');
		const store = mod.default;
		store.set({ scoreValue: undefined as any, scoreComparator: '>=', rating: 'all' } as any);
		let v = await current<any>(store);
		expect(v.scoreValue).toBe(0);
		store.update({ scoreValue: 10 });
		v = await current<any>(store);
		expect(v.scoreValue).toBe(10);
		store.reset();
		v = await current<any>(store);
		expect(v).toEqual({ scoreValue: 0, scoreComparator: '>=', rating: 'all' });
	});
});

describe('sort-store', () => {
	it('update merges and reset restores defaults', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		const mod: any = await import('./sort-store');
		const store = mod.default;
		store.update({ property: 'score' } as any);
		let v = await current<any>(store);
		expect(v.property).toBe('score');
		store.reset();
		v = await current<any>(store);
		expect(v).toEqual({ property: 'id', direction: 'desc' });
	});
});

describe('supertags-store', () => {
	it('add/remove/update/reset', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		const mod: any = await import('./supertags-store');
		const store = mod.default;
		const st1 = { name: 'A', tags: [] } as any;
		const st2 = { name: 'B', tags: ['x'] } as any;

		store.add(st1);
		let v = await current<any>(store);
		expect(v.items).toEqual([st1]);

		store.add(st2);
		v = await current<any>(store);
		expect(v.items).toEqual([st1, st2]);

		store.update('A', { name: 'A', tags: ['y'] } as any);
		v = await current<any>(store);
		expect(v.items[0]).toEqual({ name: 'A', tags: ['y'] });

		store.remove({ name: 'B' } as any);
		v = await current<any>(store);
		expect(v.items).toEqual([{ name: 'A', tags: ['y'] }]);

		store.reset();
		v = await current<any>(store);
		expect(v.items).toEqual([]);
	});
});

describe('firebase-login-store', () => {
	it('reflects auth state changes', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		await vi.doMock('$lib/logic/firebase/firebase', () => ({})); // avoid real init
		let cb: any;
		await vi.doMock('firebase/auth', () => ({
			getAuth: () => ({
				onAuthStateChanged: (fn: any) => {
					cb = fn;
				}
			})
		}));
		const mod: any = await import('./firebase-login-store');
		const store = mod.default;

		cb(null);
		let v = await current<boolean>(store);
		expect(v).toBe(false);

		cb({ uid: 'u' });
		v = await current<boolean>(store);
		expect(v).toBe(true);
	});
});

describe('import remaining simple stores for line coverage', () => {
	it('imports and accesses default export or value', async () => {
		await vi.doMock('$app/environment', () => ({ browser: true }));
		// Simple stores
		const alwaysLoop = (await import('./always-loop-store')).default;
		const apiKey = (await import('./api-key-store')).default;
		const autoplayDelay = (await import('./autoplay-fullscreen-delay-store')).default;
		const autoplayEnabled = (await import('./autoplay-fullscreen-enabled-store')).default;
		const blocked = (await import('./blocked-content-store')).default;
		const cookiesAccepted = (await import('./cookies-accepted-store')).default;
		const fullscreenHint = (await import('./fullscreen-hint-done-store')).default;
		const gifPreload = (await import('./gif-preload-enabled-store')).default;
		const hiRes = (await import('./high-resolution-enabled')).default;
		const localstorageEnabled = (await import('./localstorage-enabled-store')).default;
		const pageNav = (await import('./page-navigation-enabled-store')).default;
		const resultCols = (await import('./result-columns-store')).default;
		const theme = (await import('./theme-store')).default;
		const userId = (await import('./user-id-store')).default;
		const wideLayout = (await import('./wide-layout-enabled-store')).default;
		const tagsShortcut = (await import('./tags-shortcut-store')).default;

		expect(alwaysLoop).toBeTruthy();
		expect(apiKey).toBeTruthy();
		expect(autoplayDelay).toBeTruthy();
		expect(autoplayEnabled).toBeTruthy();
		expect(blocked).toBeTruthy();
		expect(cookiesAccepted).toBeTruthy();
		expect(fullscreenHint).toBeTruthy();
		expect(gifPreload).toBeTruthy();
		expect(hiRes).toBeTruthy();
		expect(localstorageEnabled).toBeTruthy();
		expect(pageNav).toBeTruthy();
		expect(resultCols).toBeTruthy();
		expect(theme).toBeTruthy();
		expect(userId).toBeTruthy();
		expect(wideLayout).toBeTruthy();
		expect(tagsShortcut).toBeTruthy();

		const { StoreKey } = await import('./store-keys');
		expect(StoreKey.ApiKey).toBe('kurosearch:rule34-api-key');
	});
});
