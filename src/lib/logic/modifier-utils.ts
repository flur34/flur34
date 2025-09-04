const ORDER = ['+', '-', '~'] as const;

export const nextModifier = (modifier: kurosearch.TagModifier) => {
	const index = ORDER.indexOf(modifier as any);
	if (index === -1) {
		return ORDER[0];
	}
	const nextIndex = (index + 1) % ORDER.length;
	return ORDER[nextIndex];
};
