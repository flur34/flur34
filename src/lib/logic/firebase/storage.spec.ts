import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSearchableTag, createSupertag } from '../tag-utils';

// Mutable state for mocks
let currentUser: any = undefined;
let preferencesData: any = undefined;
let docsData: Array<{ id: string; data: any }> = [];
let throwGetDoc = false;
let throwGetDocs = false;
let throwRunTransaction = false;

// Firestore transaction spies
const txDelete = vi.fn();
const txSet = vi.fn();

// Mocks for Firebase Auth and Firestore
vi.mock('firebase/auth', () => ({
	getAuth: vi.fn(() => ({ currentUser }))
}));

const getDocMock = vi.fn(async () => {
	if (throwGetDoc) throw new Error('getDoc failed');
	return { data: () => preferencesData } as any;
});

const getDocsMock = vi.fn(async () => {
	if (throwGetDocs) throw new Error('getDocs failed');
	return {
		forEach: (cb: (d: any) => void) => {
			docsData.forEach((d) => cb({ id: d.id, data: () => d.data }));
		}
	} as any;
});

const setDocMock = vi.fn(async () => {});
const docMock = vi.fn((..._args: any[]) => ({}) as any);
const getFirestoreMock = vi.fn(() => ({}) as any);
const collectionMock = vi.fn((..._args: any[]) => ({}) as any);
const queryMock = vi.fn((..._args: any[]) => ({}) as any);

const runTransactionMock = vi.fn(async (_db: any, updateFn: (tx: any) => Promise<void>) => {
	if (throwRunTransaction) throw new Error('runTransaction failed');
	await updateFn({ delete: txDelete, set: txSet });
});

vi.mock('firebase/firestore', () => ({
	getDoc: getDocMock,
	getDocs: getDocsMock,
	setDoc: setDocMock,
	doc: docMock,
	getFirestore: getFirestoreMock,
	collection: collectionMock,
	query: queryMock,
	runTransaction: runTransactionMock
}));

// Silence expected warnings during error-path tests (recreate after module reset)
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	currentUser = undefined;
	preferencesData = undefined;
	docsData = [];
	throwGetDoc = false;
	throwGetDocs = false;
	throwRunTransaction = false;

	getDocMock.mockClear();
	getDocsMock.mockClear();
	setDocMock.mockClear();
	docMock.mockClear();
	getFirestoreMock.mockClear();
	collectionMock.mockClear();
	queryMock.mockClear();
	runTransactionMock.mockClear();
	txDelete.mockClear();
	txSet.mockClear();

	vi.resetModules();
	warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('firebase/storage', () => {
	it('getSettingsAndSupertags returns undefineds when no currentUser', async () => {
		const mod = await import('./storage');
		const result = await mod.getSettingsAndSupertags();
		expect(result).toEqual({ settings: undefined, supertags: undefined });
		expect(getDocMock).not.toHaveBeenCalled();
		expect(getDocsMock).not.toHaveBeenCalled();
	});

	it('getSettingsAndSupertags returns preferences and parsed supertags for current user', async () => {
		currentUser = { uid: 'u1' };
		preferencesData = { preferences: { theme: 'dark' } };
		docsData = [
			{
				id: 'pack1',
				data: {
					description: 'desc1',
					tags: { a: 'required', b: 'excluded' }
				}
			},
			{
				id: 'pack2',
				data: {
					description: 'desc2',
					tags: { c: 'exact' }
				}
			}
		];

		const mod = await import('./storage');
		const { settings, supertags } = await mod.getSettingsAndSupertags();

		expect(settings).toEqual({ theme: 'dark' });
		expect(supertags).toHaveLength(2);
		// Verify first supertag mapping
		const st1 = supertags?.find((s) => (s as any).name === 'pack1') as any;
		expect(st1.description).toBe('desc1');
		expect(st1.tags.map((t: any) => t.name)).toEqual(['a', 'b']);
	});

	it('getSettingsAndSupertags handles getDoc error and getDocs error with warnings', async () => {
		currentUser = { uid: 'u1' };
		throwGetDoc = true;
		throwGetDocs = true;

		const mod = await import('./storage');
		const { settings, supertags } = await mod.getSettingsAndSupertags();

		expect(settings).toBeUndefined();
		expect(supertags).toBeUndefined();
		expect(warnSpy).toHaveBeenCalled();
	});

	it('saveSettingsAndSupertags sets preferences and writes supertags for current user', async () => {
		currentUser = { uid: 'u1' };
		const mod = await import('./storage');

		const supertags = [
			createSupertag('pack1', 'desc1', [
				createSearchableTag('required' as any, 'a'),
				createSearchableTag('excluded' as any, 'b')
			])
		];

		await mod.saveSettingsAndSupertags({ some: 'setting' } as any, supertags as any);

		// setPreferences path
		expect(setDocMock).toHaveBeenCalledTimes(1);
		// @ts-expect-error - mockClear doesn't exist'
		expect(setDocMock.mock.calls[0][2]).toEqual({ merge: true });

		// setSupertags path
		expect(runTransactionMock).toHaveBeenCalledTimes(1);
		expect(getDocsMock).toHaveBeenCalled();
		// For each existing doc, a delete is issued (our mock returns none by default)
		// New supertags are written
		expect(txSet).toHaveBeenCalledTimes(1);
		const [, dataArg] = txSet.mock.calls[0];
		expect(dataArg).toMatchObject({ description: 'desc1' });
	});

	it('saveSettingsAndSupertags is a no-op when no currentUser', async () => {
		const mod = await import('./storage');
		await mod.saveSettingsAndSupertags({} as any, [] as any);
		expect(setDocMock).not.toHaveBeenCalled();
		expect(runTransactionMock).not.toHaveBeenCalled();
	});

	it('saveSettingsAndSupertags catches errors in setPreferences and setSupertags', async () => {
		currentUser = { uid: 'u1' };
		setDocMock.mockImplementationOnce(async () => {
			throw new Error('setDoc failed');
		});

		const mod = await import('./storage');

		// First call triggers setPreferences error; second triggers runTransaction error
		throwRunTransaction = true;
		await mod.saveSettingsAndSupertags({} as any, [] as any);

		expect(warnSpy).toHaveBeenCalled();
	});

	it('saveSettingsAndSupertags deletes existing docs before writing new ones', async () => {
		currentUser = { uid: 'u1' };
		// Seed two existing docs so delete path is exercised
		docsData = [
			{ id: 'old1', data: { description: 'old1', tags: { x: 'required' } } },
			{ id: 'old2', data: { description: 'old2', tags: { y: 'excluded' } } }
		];

		const mod = await import('./storage');

		await mod.saveSettingsAndSupertags({} as any, [] as any);

		expect(runTransactionMock).toHaveBeenCalledTimes(1);
		expect(getDocsMock).toHaveBeenCalledTimes(1);
		// One delete per existing document
		expect(txDelete).toHaveBeenCalledTimes(2);
		// No new supertags written since input was empty
		expect(txSet).not.toHaveBeenCalled();
	});
});
