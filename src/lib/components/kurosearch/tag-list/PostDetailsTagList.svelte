<script lang="ts">
	import activeTagsStore from '$lib/store/active-tags-store';
	import SimpleTag from '../tag-simple/SimpleTag.svelte';

	interface Props {
		tags: kurosearch.Tag[];
	}

	let { tags }: Props = $props();

	const getNextModifier = (
		currentModifier?: kurosearch.TagModifier
	): kurosearch.TagModifier | null => {
		switch (currentModifier) {
			case undefined:
				return '+';
			case '+':
				return '~';
			case '~':
				return '-';
			case '-':
				return null; // Remove tag on next click
			default:
				return '+';
		}
	};
</script>

<ul class="tags">
	{#each tags as tag}
		{@const activeTag = $activeTagsStore.find((t) => t.name === tag.name)}
		<SimpleTag
			{tag}
			onclick={() => {
				const nextModifier = getNextModifier(activeTag?.modifier);
				if (nextModifier === null) {
					activeTagsStore.removeByName(tag.name);
				} else {
					activeTagsStore.addOrReplace({ ...tag, modifier: nextModifier });
				}
			}}
			onLongPress={() => {
				activeTagsStore.removeByName(tag.name);

			}}
			modifier={activeTag?.modifier}
			/>
	{/each}
</ul>

<style lang="scss">
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
