const BLOCKING_GROUP_TAGS_CONST = {
	'AI-Generated': ['ai_generated'],
	'Animal-Related': [
		'zoophilia',
		'zoo',
		'canine*',
		'equine*',
		'*feral*',
		'bestiality',
		'zoophilia',
		'animal'
	],
	'Non-Consensual': [
		'captive',
		'captured',
		'defeated',
		'rape',
		'*_slave',
		'no_consent',
		'molestation',
		'non-con*',
		'scared',
		'forced'
	],
	Gore: ['gore', 'necrophilia', 'amputee', 'guro', 'blood', 'amputed*'],
	Scat: ['scat', 'diaper', 'fart'],
	Vore: ['vore'],
	Yuri: ['yuri', 'female_focus', 'female_only', '*girls', '1girl', 'lesbian*', 'mutial_yuri'],
	Yaoi: ['yaoi', 'male_focus', 'male_only', '*boys', '1boy', 'gay*']
} as const satisfies Record<kurosearch.BlockingGroup, readonly string[]>;

export const BLOCKING_GROUP_TAGS = Object.freeze(BLOCKING_GROUP_TAGS_CONST);

export const ALL_BLOCKING_GROUPS = Object.freeze(
	Object.keys(BLOCKING_GROUP_TAGS_CONST) as readonly (keyof typeof BLOCKING_GROUP_TAGS_CONST)[]
) as readonly kurosearch.BlockingGroup[];
