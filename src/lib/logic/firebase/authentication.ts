import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	signInWithPopup,
	signOut as signOutFirebase
} from 'firebase/auth';

const googleAuthProvider = new GoogleAuthProvider();
setPersistence(getAuth(), browserLocalPersistence);

export const signIn = async () => signInWithPopup(getAuth(), googleAuthProvider);
export const signOut = async () => signOutFirebase(getAuth());
