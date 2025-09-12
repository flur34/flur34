import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadBool = async () => {
	vi.resetModules();
	await vi.doMock('$app/environment', () => ({ browser: true }));
	return await import('./generic/bool-store');
};
const loadNumber = async () => {
	vi.resetModules();
	await vi.doMock('$app/environment', () => ({ browser: true }));
	return await import('./generic/number-store');
};
const loadString = async () => {
	vi.resetModules();
	await vi.doMock('$app/environment', () => ({ browser: true }));
	return await import('./generic/string-store');
};

const current = async <T>(store: any) =>
	new Promise<T>((resolve) => {
		let unsub: () => void;
		const stop = store.subscribe((v: T) => {
			resolve(v);
			setTimeout(() => unsub(), 0);
		});
		unsub = stop;
	});

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

describe('generic stores', () => {
	it('bool-store set and reset serialize boolean', async () => {
		const mod = await loadBool();
		const s = mod.createBoolStore('kb', false);
		s.set(true);
		expect(window.localStorage.getItem('kb')).toBe('true');
		s.reset();
		// reset to initial false
		const v = await current<boolean>(s);
		expect(v).toBe(false);
	});

	it('number-store set and reset via JSON serialization', async () => {
		const mod = await loadNumber();
		const s = mod.createNumberStore('kn', 1);
		s.set(3);
		expect(window.localStorage.getItem('kn')).toBe(JSON.stringify(3));
		s.reset();
		const v = await current<number>(s);
		expect(v).toBe(1);
	});

	it('string-store set and reset with raw serializer', async () => {
		const mod = await loadString();
		const s = mod.createStringStore('ks', 'x');
		s.set('abc');
		expect(window.localStorage.getItem('ks')).toBe('abc');
		s.reset();
		const v = await current<string>(s);
		expect(v).toBe('x');
	});
});
