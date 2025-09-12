import { addIndexedPosts, addIndexedPost, getIndexedPost } from '$lib/indexeddb/idb';
import { replaceHtmlEntities } from '$lib/logic/replace-html-entities';
import { getTagTypePriority } from '$lib/logic/tag-type-data';
import { fetchAbortPrevious } from '../fetchAbortPrevious';
import { parseJson } from '$lib/logic/parse-utils';

export const PAGE_SIZE = 20;
const API_ENDPOINT = '/api/posts';

const getPageAbortController: AbortController | null = null;

const isTestEnv = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';

export const getPage = async (
	pageNumber: number,
	tags: string,
	apiKey: string = '',
	userId: string = ''
) => {
	const url = getPostsUrl(pageNumber, tags, apiKey, userId);
	const response = await fetchAbortPrevious(url, getPageAbortController);
	throwOnUnexpectedStatus(response);

	try {
		let data = await parseJson(response);
		// sometimes api returns placeholders that cause lots of null issues
		data = data.filter((x: r34.Post) => x.change);

		const posts = data.map(parsePost) as kurosearch.Post[];

		addIndexedPosts(posts);

		return posts;
	} catch (error) {
		if (!isTestEnv) console.warn('Failed to get posts', error);
		return [];
	}
};

export const getCount = async (tags: string, apiKey: string = '', userId: string = '') => {
	try {
		const response = await fetchAbortPrevious(
			getCountUrl(tags, apiKey, userId),
			getPageAbortController
		);

		throwOnUnexpectedStatus(response);
		const text = await response.text();
		const parser = new DOMParser();
		const xml = parser.parseFromString(text, 'text/xml');
		const count = Number(xml.getElementsByTagName('posts')[0].getAttribute('count'));

		throwOnInvalidCount(count);

		return count;
	} catch (error) {
		if (!isTestEnv) console.warn('Failed to get count', error);
		return 0;
	}
};

export const getPost = async (id: number, apiKey: string = '', userId: string = '') => {
	const indexedPost = await getIndexedPost(id);
	if (indexedPost !== undefined) {
		return indexedPost;
	}
	const url = new URL(
		`${API_ENDPOINT}?fields=tag_info&id=${id}`,
		typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
	);
	if (userId && apiKey) {
		url.searchParams.append('api_key', apiKey);
		url.searchParams.append('user_id', userId);
	}

	const response = await fetch(url.toString());
	throwOnUnexpectedStatus(response);

	const data = await parseJson(response);
	const post = parsePost(data[0]);

	addIndexedPost(post);

	return post;
};

const throwOnUnexpectedStatus = (response: Response) => {
	if (!response.ok) {
		throw new Error(`getPage failed with http status ${response.status}`);
	}
};

const parsePost = (post: r34.Post): kurosearch.Post => {
	const height = post.height;
	const score = post.score;
	const preview_url = post.preview_url;
	const file_url = post.file_url;
	const parent_id = post.parent_id;
	const sample_url = post.sample_url;
	const sample_width = post.sample_width;
	const sample_height = post.sample_height;
	const rating = post.rating;
	const tagInfo = post.tag_info;
	const tags = post.tags;
	const id = post.id;
	const width = post.width;
	const change = post.change;
	const comment_count = post.comment_count;
	const status = post.status;
	const source = post.source;

	return {
		preview_url,
		sample_url,
		file_url,
		comment_count: Number(comment_count),
		height: Number(height),
		id: Number(id),
		change: Number(change) * 1000,
		parent_id: parent_id ? Number(parent_id) : undefined,
		rating: rating as kurosearch.Rating,
		sample_height: Number(sample_height),
		sample_width: Number(sample_width),
		score: Number(score),
		source,
		status,
		tags: tagInfo ? parseTagInfo(tagInfo) : parseSimpleTags(tags),
		width: Number(width),
		type: parsePostType(file_url)
	};
};

const parseTagInfo = (tagInfo: r34.Tag[]): kurosearch.Tag[] => {
	return tagInfo.map(parseTag).sort(byDescendingPriority);
};

const parseSimpleTags = (tags: string): kurosearch.Tag[] => {
	return tags.split(' ').map(parseSimpleTag);
};

const parseTag = ({ tag, count, type }: r34.Tag): kurosearch.Tag => ({
	name: replaceHtmlEntities(tag),
	count,
	type
});

const parseSimpleTag = (name: string): kurosearch.Tag => ({
	name: replaceHtmlEntities(name),
	count: 0,
	type: 'ambiguous'
});

const byDescendingPriority = (a: kurosearch.Tag, b: kurosearch.Tag) =>
	getTagTypePriority(a.type) - getTagTypePriority(b.type);

export const getPostsUrl = (
	pageNumber: number,
	serializedTags: string,
	apiKey: string = '',
	userId: string = ''
) => {
	const base = new URL(
		`${API_ENDPOINT}?fields=tag_info&limit=${PAGE_SIZE}&pid=${pageNumber}`,
		typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
	);
	if (userId && apiKey) {
		base.searchParams.append('api_key', apiKey);
		base.searchParams.append('user_id', userId);
	}
	return serializedTags === '' ? base.toString() : `${base.toString()}&tags=${serializedTags}`;
};

export const getCountUrl = (serializedTags: string, apiKey: string, userId: string) => {
	const base = new URL(
		`${API_ENDPOINT}?limit=0`,
		typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
	);
	if (userId && apiKey) {
		base.searchParams.append('api_key', apiKey);
		base.searchParams.append('user_id', userId);
	}
	return serializedTags === '' ? base.toString() : `${base.toString()}&tags=${serializedTags}`;
};

const throwOnInvalidCount = (count: unknown) => {
	if (!Number.isFinite(count as number)) {
		throw new Error('Unexpected response received in getPage');
	}
};

const parsePostType = (file_url: string): kurosearch.PostType => {
	return file_url.endsWith('.webm') || file_url.endsWith('.mp4')
		? 'video'
		: file_url.includes('.gif')
			? 'gif'
			: 'image';
};
