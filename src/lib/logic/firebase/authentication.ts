import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	signInWithPopup,
	signOut as signOutFirebase
} from 'firebase/auth';

const googleAuthProvider = new GoogleAuthProvider();

let persistenceInitialized = false;
const ensurePersistence = async () => {
	if (persistenceInitialized) return;
	try {
		await setPersistence(getAuth(), browserLocalPersistence);
	} catch (_err) {
		// Swallow in tests or non-browser envs; callers still work with default persistence
	}
	persistenceInitialized = true;
};

export const signIn = async () => {
	await ensurePersistence();
	return signInWithPopup(getAuth(), googleAuthProvider);
};
export const signOut = async () => {
	await ensurePersistence();
	return signOutFirebase(getAuth());
};
