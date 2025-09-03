// Lightweight in-memory mock for $lib/indexeddb/idb used in tests
// Provides add/get for posts, comments, and tags.

const posts = new Map<number, kurosearch.Post>();
const comments = new Map<number, { postId: number; items: any[] }>();
const tags = new Map<string, kurosearch.Tag>();

export const addIndexedPosts = async (items: kurosearch.Post[]) => {
	for (const p of items) {
		posts.set(p.id, p);
	}
};

export const addIndexedPost = async (item: kurosearch.Post) => {
	posts.set(item.id, item);
};

export const getIndexedPost = async (id: number) => {
	return posts.get(id);
};

export const addIndexedComments = async (postId: number, items: any[]) => {
	comments.set(postId, { postId, items });
};

export const getIndexedComments = async (postId: number) => {
	return comments.get(postId)?.items;
};

export const addIndexedTag = async (tag: kurosearch.Tag) => {
	tags.set(tag.name, tag);
};

export const getIndexedTag = async (name: string) => {
	return tags.get(name);
};

export const __reset = () => {
	posts.clear();
	comments.clear();
	tags.clear();
};
