<script lang="ts">
	import { formatActiveTag } from '$lib/logic/format-tag';
	import { MODIFIER_NAMES } from '$lib/logic/tag-modifier-data';
	import { TAG_TYPES_WITH_ICONS } from '$lib/logic/tag-type-data';

	interface Props {
		tag: kurosearch.ModifiedTag;
		active?: boolean;
		onclick?: (event: MouseEvent) => void;
		oncontextmenu?: (event: MouseEvent) => void;
	}

	let { tag, active = false, onclick, oncontextmenu }: Props = $props();

	let icon = $derived(TAG_TYPES_WITH_ICONS[tag.type] ?? 'no-icon');
</script>

<li>
	<button
		type="button"
		class:active
		class:exclude={tag.modifier === '-'}
		class:optional={tag.modifier === '~'}
		class="{MODIFIER_NAMES[tag.modifier]} {icon}"
		title="Click to remove tag"
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onclick?.(e);
		}}
		oncontextmenu={(e) => {
			e.preventDefault();
			e.stopPropagation();
			oncontextmenu?.(e);
		}}
	>
		{formatActiveTag(tag)}
	</button>
</li>

<style lang="scss">
	@use 'sass:map';

	// SCSS Variables and Maps
	$tag-height: 24px;
	$tag-padding-with-icon: 6px 12px;
	$tag-padding-no-icon: 12px;
	$tag-border-radius: var(--border-radius);
	$tag-font-size: var(--text-size-small);
	$tag-gap: var(--tiny-gap);

	// Color scheme maps
	$default-colors: (
		background: var(--background-2),
		background-hover: var(--background-3),
		color: var(--text)
	);

	$accent-colors: (
		background: var(--accent),
		background-hover: var(--accent-light),
		color: var(--text-accent)
	);

	// Modifier-specific color schemes using the CSS variables
	$modifier-colors: (
		active: (
			background: var(--tag-active-background),
			background-hover: var(--tag-active-background-hover),
			color: var(--tag-active-color)
		),
		exclude: (
			background: var(--tag-negated-background),
			background-hover: var(--tag-negated-background-hover),
			color: var(--tag-negated-color)
		),
		optional: (
			background: var(--tag-optional-background),
			background-hover: var(--tag-optional-background-hover),
			color: var(--tag-optional-color)
		)
	);

	$tag-type-colors: (
		codicon-edit: (
			background: var(--artist-background),
			background-hover: var(--artist-background-hover),
			color: var(--artist-color)
		),
		codicon-person: (
			background: var(--character-background),
			background-hover: var(--character-background-hover),
			color: var(--character-color)
		),
		codicon-folder: (
			background: var(--copyright-background),
			background-hover: var(--copyright-background-hover),
			color: var(--copyright-color)
		),
		codicon-info: (
			background: var(--metadata-background),
			background-hover: var(--metadata-background-hover),
			color: var(--metadata-color)
		),
		codicon-tag: (
			background: var(--general-background),
			background-hover: var(--general-background-hover),
			color: var(--general-color)
		)
	);

	// SCSS Mixins
	@mixin tag-base-style {
		display: inline-flex;
		align-items: center;
		gap: $tag-gap;
		height: $tag-height;
		border-radius: $tag-border-radius;
		font-size: $tag-font-size;
		user-select: none;
		padding-inline: $tag-padding-with-icon;
		border: none;
		cursor: pointer;
		contain: content;
	}

	@mixin color-scheme($colors) {
		background-color: map.get($colors, background);
		color: map.get($colors, color);
		--background-color: #{map.get($colors, background)};
		--background-color-hover: #{map.get($colors, background-hover)};
	}

	@mixin hover-transition {
		@media (hover: hover) {
			transition: background-color var(--default-transition-behaviour);

			&:hover {
				background-color: var(--background-color-hover);
			}
		}
	}

	@mixin active-state {
		&:active {
			background-color: var(--background-color);
		}
	}

	@mixin modifier-state($modifier-name) {
		$colors: map.get($modifier-colors, $modifier-name);
		@include color-scheme($colors);

		// Additional modifier-specific styles using the CSS variables
		@if $modifier-name == 'optional' {
			font-style: italic;
			opacity: var(--tag-optional-opacity);
		}

		@if $modifier-name == 'exclude' {
			text-decoration: line-through;
			opacity: var(--tag-negated-opacity);
		}
	}

	// Main button styles
	button {
		@include tag-base-style;
		@include color-scheme($default-colors);
		@include hover-transition;
		@include active-state;

		// No icon modifier
		&.no-icon {
			padding-inline: $tag-padding-no-icon;
		}

		// Tag modifier states using new color system
		&.active {
			@include modifier-state('active');
		}

		&.optional {
			@include modifier-state('optional');
		}

		&.exclude {
			@include modifier-state('exclude');
		}

		// Tag type specific colors
		@each $class, $colors in $tag-type-colors {
			&.#{$class} {
				--background-color: #{map.get($colors, background)};
				--background-color-hover: #{map.get($colors, background-hover)};
				color: map.get($colors, color);

				// For non-modifier states, use tag type colors directly
				&:not(.active):not(.optional):not(.exclude) {
					background-color: map.get($colors, background);
				}
			}
		}

		// When modifier states are applied, they override tag type colors
		// This ensures modifier colors take precedence
		&.active,
		&.optional,
		&.exclude {
			// Reset tag type specific colors when modifier is active
			@each $class, $colors in $tag-type-colors {
				&.#{$class} {
					--background-color: var(--background-color);
					--background-color-hover: var(--background-color-hover);
				}
			}
		}
	}
</style>
