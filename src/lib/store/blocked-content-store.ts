import { persistentWritable } from './persistent-store';
import { StoreKey } from './store-keys';

const getInitial = () => ({
	'AI-Generated': false,
	'Animal-Related': false,
	'Non-Consensual': false,
	Gore: false,
	Scat: false,
	Vore: false
});

const createBlockedContentStore = () => {
	const { subscribe, set } = persistentWritable(StoreKey.BlockedContent, getInitial());

	return {
		subscribe,
		set,
		reset: () => set(getInitial())
	};
};

export default createBlockedContentStore();
