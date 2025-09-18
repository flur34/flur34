<script lang="ts">
	import { formatTagname } from '$lib/logic/format-tag';
	import { TAG_TYPES_WITH_ICONS } from '$lib/logic/tag-type-data';
	import { MODIFIER_TITLES } from '$lib/logic/tag-modifier-data';

	interface Props {
		tag: kurosearch.Tag;
		modifier?: kurosearch.TagModifier;
		isActive?: boolean;
		onclick?: () => void;
	}

	let { tag, modifier, onclick }: Props = $props();

	let dynamicTitle = $derived(MODIFIER_TITLES[modifier ?? '+']);

	let icon = $derived(TAG_TYPES_WITH_ICONS[tag.type] ?? 'no-icon');
</script>

<li>
	<button
		type="button"
		title={dynamicTitle}
		{onclick}
		class:active={modifier === '+'}
		class:negated={modifier === '-'}
		class:optional={modifier === '~'}
		class={icon}
	>
		{formatTagname(tag.name)}
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
  $supertag-border-width: 2px;

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

  // Modifier-specific color schemes using the new CSS variables
  $modifier-colors: (
          active: (
                  background: var(--tag-active-background),
                  background-hover: var(--tag-active-background-hover),
                  color: var(--tag-active-color)
          ),
          negated: (
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
      background-color: var(--background-1);
    }
  }

  @mixin modifier-state($modifier-name) {
    $colors: map.get($modifier-colors, $modifier-name);
    @include color-scheme($colors);

    // Additional modifier-specific styles using the new CSS variables
    @if $modifier-name == 'optional' {
      font-style: italic;
      opacity: var(--tag-optional-opacity);
    }

    @if $modifier-name == 'negated' {
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
      @include hover-transition; // Re-apply hover transition after color scheme
    }

    &.optional {
      @include modifier-state('optional');
      @include hover-transition; // Re-apply hover transition after color scheme
    }

    &.negated {
      @include modifier-state('negated');
      @include hover-transition; // Re-apply hover transition after color scheme
    }

    // Supertag special styling
    &.supertag {
      @include color-scheme($accent-colors);
      border: dashed $supertag-border-width var(--text-accent);

      // Override hover and active states for supertags
      @media (hover: hover) {
        &:hover {
          background-color: map.get($accent-colors, background);
        }
      }

      &:active {
        background-color: map.get($accent-colors, background);
      }
    }

    // Tag type specific colors
    @each $class, $colors in $tag-type-colors {
      &.#{$class} {
        // For non-modifier states, use tag type colors directly
        &:not(.active):not(.optional):not(.negated) {
          --background-color: #{map.get($colors, background)};
          --background-color-hover: #{map.get($colors, background-hover)};
          background-color: map.get($colors, background);
          color: map.get($colors, color);
        }
      }
    }
  }
</style>
