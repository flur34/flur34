import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted fns to avoid factory-hoist issues
const hoisted = vi.hoisted(() => ({
	setPersistence: vi.fn(async () => {}),
	signInWithPopup: vi.fn(async () => 'signed-in'),
	signOut: vi.fn(async () => 'signed-out')
}));

// Mocks for Firebase Auth SDK
let authObject: any;

vi.mock('firebase/auth', () => ({
	browserLocalPersistence: { id: 'browserLocalPersistence' },
	getAuth: vi.fn(() => authObject),
	GoogleAuthProvider: class GoogleAuthProvider {},
	setPersistence: hoisted.setPersistence,
	signInWithPopup: hoisted.signInWithPopup,
	signOut: hoisted.signOut
}));

// Import from mocked module to use in expectations
import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	signInWithPopup,
	signOut
} from 'firebase/auth';

beforeEach(() => {
	authObject = { user: 'auth' };
	// @ts-expect-error - mockClear doesn't exist
	setPersistence.mockClear();
	// @ts-expect-error - mockClear doesn't exist
	signInWithPopup.mockClear();
	// @ts-expect-error - mockClear doesn't exist
	signOut.mockClear();
	(getAuth as any).mockClear?.();
	vi.resetModules();
});

describe('authentication', () => {
	it('initializes persistence lazily and exposes signIn/signOut wrappers', async () => {
		// Load module (no side-effect now)
		const mod = await import('./authentication');

		// No persistence set yet
		expect(setPersistence).not.toHaveBeenCalled();

		// signIn triggers persistence and delegates to signInWithPopup(getAuth(), new GoogleAuthProvider())
		await mod.signIn();
		expect(setPersistence).toHaveBeenCalledTimes(1);
		expect(setPersistence).toHaveBeenCalledWith(authObject, browserLocalPersistence);
		expect(signInWithPopup).toHaveBeenCalledTimes(1);
		// @ts-ignore
		const [authArg, providerArg] = signInWithPopup.mock.calls[0];
		expect(authArg).toBe(authObject);
		expect(providerArg).toBeInstanceOf(GoogleAuthProvider as any);

		// signOut delegates to signOut(getAuth()) and does not reinitialize persistence
		await mod.signOut();
		expect(signOut).toHaveBeenCalledTimes(1);
		expect(signOut).toHaveBeenCalledWith(authObject);
		expect(setPersistence).toHaveBeenCalledTimes(1);
	});

	it('handles persistence failure gracefully (catch branch)', async () => {
		// Force setPersistence to reject for this module instance
		// @ts-ignore
		setPersistence.mockImplementationOnce(async () => {
			throw new Error('persist-fail');
		});
		const mod = await import('./authentication');
		await mod.signIn();
		// Should still attempt persistence and proceed with sign-in
		expect(setPersistence).toHaveBeenCalledTimes(1);
		expect(signInWithPopup).toHaveBeenCalledTimes(1);
	});
});
