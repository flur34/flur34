import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (): Promise<{ containerVersion: string }> => {
	return {
		containerVersion: env.CONTAINER_VERSION ?? 'Unavailable'
	};
};
