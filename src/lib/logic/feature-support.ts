import { browser } from '$app/environment';

export const supportsUrlSharing = () => browser && 'share' in window.navigator;
export const supportsFlexGap = (() => {
	if (!browser) return false;

	// create flex container with row-gap set
	const flex = document.createElement('div');
	flex.style.display = 'flex';
	flex.style.flexDirection = 'column';
	flex.style.rowGap = '1px';

	// create two, elements inside it
	flex.appendChild(document.createElement('div'));
	flex.appendChild(document.createElement('div'));

	// append to the DOM (needed to obtain scrollHeight)
	document.body.appendChild(flex);
	const isSupported = flex.scrollHeight === 1; // flex container should be 1px high from the row-gap
	flex.parentNode.removeChild(flex);

	return isSupported;
})();

export const supportsGap = browser && 'gap' in document.body.style;
export const supportsAspectRatio = browser && 'aspect-ratio' in document.body.style;
export const supportsObjectFit = browser && 'object-fit' in document.body.style;
export const supportsFullscreen = browser && document.fullscreenEnabled;
export const supportsLocalStorage = browser && Boolean(localStorage);
export const supportsSessionStorage = browser && Boolean(sessionStorage);
