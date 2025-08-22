import { getAuth } from 'firebase/auth';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	runTransaction,
	setDoc
} from 'firebase/firestore';
import { createSearchableTag, createSupertag } from '../tag-utils';
import { logFirestoreRead, logFirestoreWrite } from './analytics';

export const getSettingsAndSupertags = async () => {
	await logFirestoreRead();
	const settings = await getPreferences();
	const supertags = await getSupertags();

	return { settings, supertags };
};

const getPreferences = async () => {
	try {
		const { currentUser } = getAuth();
		if (currentUser) {
			const document = await getDoc(doc(getFirestore(), 'users', currentUser.uid));
			return document.data()?.preferences;
		}
	} catch (err) {
		console.warn('Failed to get user document:', err);
		return undefined;
	}
};

const setPreferences = async (preferences: any) => {
	try {
		const { currentUser } = getAuth();
		if (currentUser) {
			await setDoc(doc(getFirestore(), 'users', currentUser.uid), preferences, { merge: true });
		}
	} catch (err) {
		console.warn('Failed to save user document:', err);
	}
};

const getSupertags = async () => {
	try {
		const { currentUser } = getAuth();
		if (currentUser) {
			const documents = await getDocs(
				query(collection(getFirestore(), `users/${currentUser.uid}/supertags`))
			);
			const supertags: kurosearch.Supertag[] = [];
			documents.forEach((document) => {
				const data = document.data();
				supertags.push(
					createSupertag(
						document.id,
						data.description,
						Object.entries(data.tags).map((e) =>
							createSearchableTag(e[1] as kurosearch.TagModifier, e[0])
						)
					)
				);
			});
			return supertags;
		}
	} catch (err) {
		console.warn('Failed to get user document:', err);
		return undefined;
	}
};

const setSupertags = async (supertags: kurosearch.Supertag[]) => {
	try {
		const { currentUser } = getAuth();
		if (currentUser) {
			await runTransaction(getFirestore(), async (transaction) => {
				const documents = await getDocs(
					query(collection(getFirestore(), `users/${currentUser.uid}/supertags`))
				);
				documents.forEach(async (document) =>
					transaction.delete(
						doc(getFirestore(), `users/${currentUser.uid}/supertags/${document.id}`)
					)
				);
				supertags.map((supertag) =>
					transaction.set(
						doc(getFirestore(), `users/${currentUser.uid}/supertags`, supertag.name),
						{
							description: supertag.description,
							tags: Object.fromEntries(supertag.tags.map((t) => [t.name, t.modifier]))
						}
					)
				);
			});
		}
	} catch (err) {
		console.warn('Failed to save user document:', err);
	}
};

export const saveSettingsAndSupertags = async (settings: any, supertags: kurosearch.Supertag[]) => {
	await logFirestoreWrite();
	await setPreferences(settings);
	await setSupertags(supertags);
};
