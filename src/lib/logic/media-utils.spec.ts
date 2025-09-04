import { describe, it, expect } from 'vitest';
import {
	isGif,
	getGifSources,
	isVideo,
	getVideoSources,
	isLoop,
	isAnimated,
	getExtension
} from './media-utils';

describe('media-utils', () => {
	it('isGif detects .gif only (case-sensitive)', () => {
		expect(isGif('image.gif')).toBe(true);
		expect(isGif('image.GIF')).toBe(false);
		expect(isGif('image.png')).toBe(false);
	});

	it('getGifSources chooses preview/sample when sample is gif, else sample/full', () => {
		const full = 'https://cdn/site/file.png';
		const sampleGif = 'https://cdn/site/sample.gif';
		const samplePng = 'https://cdn/site/sample.png';
		const preview = 'https://cdn/site/preview.jpg';

		expect(getGifSources(full, sampleGif, preview)).toEqual({
			static: preview,
			animated: sampleGif
		});
		expect(getGifSources(full, samplePng, preview)).toEqual({ static: samplePng, animated: full });
	});

	it('isVideo detects .mp4 and .webm only (case-sensitive)', () => {
		expect(isVideo('clip.mp4')).toBe(true); // first branch of OR
		expect(isVideo('clip.webm')).toBe(true); // second branch of OR
		expect(isVideo('clip.MP4')).toBe(false);
		expect(isVideo('clip.mov')).toBe(false);
	});

	it('getVideoSources chooses preview/sample when sample is video, else sample/full', () => {
		const full = 'https://cdn/site/file.png';
		const sampleMp4 = 'https://cdn/site/sample.mp4';
		const samplePng = 'https://cdn/site/sample.png';
		const preview = 'https://cdn/site/preview.jpg';

		expect(getVideoSources(full, sampleMp4, preview)).toEqual({
			static: preview,
			animated: sampleMp4
		});
		expect(getVideoSources(full, samplePng, preview)).toEqual({
			static: samplePng,
			animated: full
		});
	});

	it('isLoop returns true when a tag named "loop" is present', () => {
		const tags: kurosearch.Tag[] = [
			{ name: 'artist:someone', count: 1, type: 'artist' },
			{ name: 'loop', count: 2, type: 'metadata' }
		];
		expect(isLoop(tags)).toBe(true);
		expect(isLoop([{ name: 'not_loop', count: 0, type: 'general' }])).toBe(false);
		expect(isLoop([])).toBe(false);
	});

	it('isAnimated returns true for gif or video and false otherwise', () => {
		expect(isAnimated('image.gif')).toBe(true); // gif path
		expect(isAnimated('clip.webm')).toBe(true); // video path
		expect(isAnimated('image.jpg')).toBe(false);
	});

	it('getExtension returns last extension in lowercase or empty string', () => {
		expect(getExtension('file')).toBe('');
		expect(getExtension('file.PNG')).toBe('png');
		expect(getExtension('http://host/path.name/file.tar.gz')).toBe('gz');
	});
});
