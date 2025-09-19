type LongPressParams = {
	duration?: number;
	threshold?: number;
	onlongpress?: () => void;
	onclick?: (e: MouseEvent) => void;
};

type LongPressDetail = {
	originalEvent: PointerEvent | TouchEvent;
	coordinates: { x: number; y: number };
};

// Pool reused coordinate objects to reduce GC pressure
const coordinatePool: { x: number; y: number }[] = [];
const getCoordinates = (x: number, y: number) => {
	const coords = coordinatePool.pop() || { x: 0, y: 0 };
	coords.x = x;
	coords.y = y;
	return coords;
};

const returnCoordinates = (coords: { x: number; y: number }) => {
	if (coordinatePool.length < 10) {
		// Limit pool size
		coordinatePool.push(coords);
	}
};

export function longpress(node: HTMLElement, params: LongPressParams = {}) {
	// Validate and sanitize parameters once
	let duration = Math.max(50, Number(params.duration) || 300);
	let threshold = Math.max(0, Number(params.threshold) || 10);
	let onlongpress = params.onlongpress;
	let onclick = params.onclick;

	// Use more efficient data types
	let timer: ReturnType<typeof setTimeout> | null = null;
	let startX = 0;
	let startY = 0;
	let activePointerId: number | null = null;
	let isActive = false;
	let longPressTriggered = false;
	let abortController: AbortController;

	// Pre-calculate threshold squared to avoid Math.sqrt in hot path
	let thresholdSquared = threshold * threshold;

	// Debounce state
	let lastActionTime = 0;
	const DEBOUNCE_THRESHOLD = 50;

	// Cached event options to avoid object creation
	const passiveOptions = { passive: true };
	const activeOptions = {};

	function start(event: PointerEvent | TouchEvent): void {
		// Fast path for debounce check
		const now = performance.now(); // More precise than Date.now()
		if (now - lastActionTime < DEBOUNCE_THRESHOLD) return;
		lastActionTime = now;

		// Early exit for multi-touch (fastest check first)
		if (isTouchEvent(event) && event.touches.length > 1) return;

		// Cancel existing if needed
		if (isActive) cleanup();

		// Get pointer info with minimal object creation
		const p = isTouchEvent(event) ? event.touches[0] : event;
		startX = p.clientX;
		startY = p.clientY;
		activePointerId = isTouchEvent(event)
			? event.touches[0].identifier
			: (event as PointerEvent).pointerId;
		isActive = true;
		longPressTriggered = false; // Reset flag

		timer = setTimeout(() => {
			if (isActive) {
				longPressTriggered = true; // Set flag before dispatching
				try {
					const coords = getCoordinates(startX, startY);
					const customEvent = new CustomEvent<LongPressDetail>('longpress', {
						detail: {
							originalEvent: event,
							coordinates: coords
						},
						bubbles: true,
						cancelable: true
					});
					node.dispatchEvent(customEvent);
					returnCoordinates(coords);

					// Call callback if provided
					onlongpress?.();
				} catch (error) {
					console.warn('Error dispatching longpress event:', error);
				}
			}
			cleanup();
		}, duration);
	}

	function move(event: PointerEvent | TouchEvent): void {
		// Fast exit conditions
		if (!isActive) return;

		// Find active pointer/touch efficiently
		let p: { clientX: number; clientY: number } | null = null;

		if (isTouchEvent(event)) {
			const touches = event.touches;
			// Optimize common case (single touch)
			if (touches.length === 1 && touches[0].identifier === activePointerId) {
				p = touches[0];
			} else {
				// Fallback for multiple touches
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].identifier === activePointerId) {
						p = touches[i];
						break;
					}
				}
			}
			if (!p) {
				cleanup();
				return;
			}
		} else {
			if ((event as PointerEvent).pointerId !== activePointerId) return;
			p = event as PointerEvent;
		}

		// Use squared distance to avoid expensive Math.sqrt
		const dx = p.clientX - startX;
		const dy = p.clientY - startY;
		const distanceSquared = dx * dx + dy * dy;

		if (distanceSquared > thresholdSquared) {
			cleanup();
		}
	}

	function cancel(): void {
		cleanup();
	}

	function cleanup(): void {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
		isActive = false;
		activePointerId = null;
	}

	// Enhanced click handler that coordinates with longpress
	function handleClick(e: MouseEvent): void {
		if (longPressTriggered) {
			e.preventDefault();
			e.stopPropagation();
			// Reset flag after a short delay
			setTimeout(() => {
				longPressTriggered = false;
			}, 50);
			return;
		}
		onclick?.(e);
	}

	// Optimized event handlers with minimal allocations
	const onContextMenu = (e: Event): void => {
		if (isActive) e.preventDefault();
	};

	const onVisibilityChange = (): void => {
		if (document.hidden && isActive) cleanup();
	};

	const onWindowBlur = (): void => {
		if (isActive) cleanup();
	};

	const onPointerLeave = (event: PointerEvent): void => {
		if (isActive && event.pointerId === activePointerId) cleanup();
	};

	// Inline type guard for better performance
	function isTouchEvent(event: PointerEvent | TouchEvent): event is TouchEvent {
		return 'touches' in event;
	}

	// Setup with optimized listener registration
	function setupListeners(): void {
		abortController = new AbortController();
		const { signal } = abortController;

		// Combine options with signal for fewer object creations
		const passiveWithSignal = { ...passiveOptions, signal };
		const activeWithSignal = { ...activeOptions, signal };

		// Group related events for better cache locality
		node.addEventListener('pointerdown', start, activeWithSignal);
		node.addEventListener('pointerup', cancel, activeWithSignal);
		node.addEventListener('pointercancel', cancel, activeWithSignal);
		node.addEventListener('pointermove', move as EventListener, passiveWithSignal);
		node.addEventListener('pointerleave', onPointerLeave, activeWithSignal);

		node.addEventListener('touchstart', start as EventListener, passiveWithSignal);
		node.addEventListener('touchend', cancel, activeWithSignal);
		node.addEventListener('touchcancel', cancel, activeWithSignal);
		node.addEventListener('touchmove', move as EventListener, passiveWithSignal);

		node.addEventListener('contextmenu', onContextMenu, activeWithSignal);

		// Add click handler if onclick callback is provided
		if (onclick) {
			node.addEventListener('click', handleClick, activeWithSignal);
		}

		// Global listeners
		document.addEventListener('visibilitychange', onVisibilityChange, activeWithSignal);
		window.addEventListener('blur', onWindowBlur, activeWithSignal);
		window.addEventListener('beforeunload', cancel, activeWithSignal);
		window.addEventListener('pagehide', cancel, activeWithSignal);
	}

	// Initialize
	setupListeners();

	return {
		update(newParams: LongPressParams): void {
			if (isActive) cleanup();

			// Only update if values actually changed
			const newDuration = Math.max(50, Number(newParams.duration) || 300);
			const newThreshold = Math.max(0, Number(newParams.threshold) || 10);

			if (newDuration !== duration) {
				duration = newDuration;
			}

			if (newThreshold !== threshold) {
				threshold = newThreshold;
				thresholdSquared = threshold * threshold;
			}

			// Update callbacks
			const oldOnclick = onclick;
			onlongpress = newParams.onlongpress;
			onclick = newParams.onclick;

			// Re-setup listeners if onclick callback changed
			if (oldOnclick !== onclick) {
				abortController?.abort();
				setupListeners();
			}
		},

		destroy(): void {
			cleanup();
			abortController?.abort();
		}
	};
}
