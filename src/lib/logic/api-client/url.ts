export const API_URL = `/r34/index.php?page=dapi`;
export const R34_API_URL = `https://api.rule34.xxx/index.php?page=dapi`;
export const DOCKER_URL = `http://localhost:3000`;
export const SOURCE_API_URL = `https://api.github.com/repos/flurbudurbur/kurosearch`;
export const RELEASES_URL = `${SOURCE_API_URL}/releases`;
export const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;

export const BASE_URL = () => {
	return globalThis?.location?.origin ?? 'http://localhost';
};
