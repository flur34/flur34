import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onpopstate, addHistory } from './onpopstate';

describe('use/onpopstate', () => {
	let el: HTMLDivElement;
	let handler: ReturnType<typeof onpopstate>;
	let cb: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		el = document.createElement('div');
		cb = vi.fn();
		handler = onpopstate(el, cb);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		// ensure cleanup if a test failed before calling destroy
		if (handler && typeof handler.destroy === 'function') {
			handler.destroy();
		}
	});

	it('registers popstate listener and cleans up on destroy', () => {
		// trigger event -> should call cb
		window.dispatchEvent(new PopStateEvent('popstate'));
		expect(cb).toHaveBeenCalledTimes(1);

		// destroy should remove listener
		handler.destroy();
		window.dispatchEvent(new PopStateEvent('popstate'));
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('addHistory pushes a new history state with provided value', () => {
		const spy = vi.spyOn(window.history, 'pushState');
		addHistory('state-123');
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith('state-123', '', null);
	});
});
