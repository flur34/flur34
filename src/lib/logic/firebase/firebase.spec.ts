import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/app', () => ({
	initializeApp: vi.fn()
}));

// Import the mocked function so we can assert on it
import { initializeApp } from 'firebase/app';

describe('firebase', () => {
	it('initializes Firebase app with expected config on module load', async () => {
		// Dynamically import to ensure the mocked module is used and side-effects run now
		await import('./firebase');

		expect(initializeApp).toHaveBeenCalledTimes(1);
		expect(initializeApp).toHaveBeenCalledWith({
			apiKey: 'AIzaSyBHdepwE7M4Byu2lFtX2s__9COcMdvXu7Q',
			authDomain: 'r34-react.firebaseapp.com',
			databaseURL: 'https://r34-react.firebaseio.com',
			projectId: 'r34-react',
			storageBucket: 'r34-react.appspot.com',
			messagingSenderId: '844749417844',
			appId: '1:844749417844:web:3d1a590b58568e472dd021'
		});
	});
});
