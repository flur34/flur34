<script lang="ts">
	import { formatCount } from '$lib/logic/format-count';
	import RelativeTime from '../relative-time/RelativeTime.svelte';
	import Score from '../score/Score.svelte';
	import SavedPostsStore from '$lib/store/saved-posts-store';

	interface Props {
		post: kurosearch.Post;
		active?: string;
		links: number;
		ontabselected: (tab: string) => void;
	}

	let { post, active, links, ontabselected }: Props = $props();

	let saved = $derived($SavedPostsStore.posts.some((p) => p.id === post.id));

	const toggleSaved = () => {
		if (saved) {
			SavedPostsStore.remove({ id: post.id });
		} else {
			SavedPostsStore.add({ id: post.id });
		}
	};
</script>

<div class="summary">
	<RelativeTime value={post.change} />
	<span>•</span>
	<Score value={post.score} />
	<span class="divider"></span>
	<button
		type="button"
		class="codicon codicon-bookmark"
		class:active={saved}
		onclick={(e) => {
			e.stopPropagation();
			toggleSaved();
			ontabselected('saved');
		}}
		aria-label="{saved ? 'Remove from' : 'Add to'} saved posts"
	>
	</button>

	<button
		type="button"
		class="codicon codicon-link"
		class:active={active === 'links'}
		onclick={(e) => {
			e.stopPropagation();
			ontabselected('links');
		}}
	>
		{formatCount(links)}
	</button>
	{#if post.comment_count}
		<button
			type="button"
			class="codicon codicon-comment"
			class:active={active === 'comments'}
			onclick={(e) => {
				e.stopPropagation();
				ontabselected('comments');
			}}
		>
			{formatCount(post.comment_count)}
		</button>
	{/if}
	<button
		type="button"
		class="codicon codicon-tag"
		class:active={active === 'tags'}
		onclick={(e) => {
			e.stopPropagation();
			ontabselected('tags');
		}}
	>
		{formatCount(post.tags.length)}
	</button>
</div>

<style lang="scss">
	.summary {
		display: flex;
		align-items: center;
		overflow-x: auto;
		gap: var(--small-gap);
		background-color: var(--background-1);
	}

	span.divider {
		flex-grow: 1;
	}

	button {
		white-space: nowrap;
		display: inline-flex;
		gap: var(--tiny-gap);
		align-items: center;
		background-color: var(--background-2);
		padding: var(--small-gap);
		border-radius: var(--border-radius);
		border: 2px solid transparent;
		position: relative;
		overflow: hidden;
		transition: border-color 100ms ease-out;
	}

	button.active {
		background-color: var(--background-3);
	}

	button.active.codicon-bookmark {
		border-color: gold;
		color: gold;
		background-image: linear-gradient(
			110deg,
			transparent 0%,
			transparent 35%,
			rgba(255, 215, 0, 0.35) 50%,
			transparent 65%,
			transparent 100%
		);
		background-repeat: no-repeat;
		background-size: 220% 100%;
		background-position: -140% 0;
		animation: bookmark-shimmer 500ms ease-out 1;
	}

	@keyframes bookmark-shimmer {
		to {
			background-position: 140% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button.active.codicon-bookmark {
			animation: none;
			background-image: none;
		}
	}

	button::before {
		font-size: 16px;
	}
</style>
