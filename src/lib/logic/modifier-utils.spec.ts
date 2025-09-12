import { describe, it, expect } from 'vitest';
import { nextModifier } from './modifier-utils';

// Runtime uses simple string comparison; types enforce TagModifier at compile time
// We still assert behavior for valid and invalid inputs.

describe('modifier-utils nextModifier', () => {
	it("cycles '+' -> '-'", () => {
		expect(nextModifier('+')).toBe('-');
	});

	it("cycles '-' -> '~'", () => {
		expect(nextModifier('-')).toBe('~');
	});

	it("cycles '~' -> '+' (wrap-around)", () => {
		expect(nextModifier('~')).toBe('+');
	});

	it('unknown modifier falls back to start "+"', () => {
		// @ts-expect-error intentionally providing invalid modifier to test runtime
		expect(nextModifier('x')).toBe('+');
	});
});
