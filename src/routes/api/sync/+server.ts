import type { RequestHandler } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { error } from '@sveltejs/kit';

type TempFile = {
	filepath: string;
	expires: number;
	inUse: boolean;
};

const tempFiles: Map<string, TempFile> = new Map();

const generateOneTimeCode = () => {
	return String(randomInt(100000, 999999));
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const file = await request.arrayBuffer();
		const buffer = Buffer.from(file);

		const code = generateOneTimeCode();
		const temporaryDirectory = await fs.realpath(os.tmpdir());
		const filepath = path.join(temporaryDirectory, `${code}.cfg`);

		await fs.writeFile(filepath, buffer);

		// expire in 5 minutes
		tempFiles.set(code, {
			filepath,
			expires: Date.now() + 5 * 60 * 1000,
			inUse: false
		});

		// cleanup
		setTimeout(
			async () => {
				const entry = tempFiles.get(code);
				if (entry && !entry.inUse) {
					try {
						await fs.unlink(filepath);
					} catch (err) {
						console.error('Error cleaning up temp file:', err);
					}
					tempFiles.delete(code);
				}
			},
			5 * 60 * 1000
		);

		return new Response(JSON.stringify({ code }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Error in sync POST handler:', err);
		throw error(
			500,
			`Failed to generate sync code: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
	}
};

export const _getTempFile = (code: string): TempFile | undefined => {
	const entry = tempFiles.get(code);
	if (!entry) return undefined;
	if (Date.now() > entry.expires) {
		if (!entry.inUse) {
			fs.unlink(entry.filepath).catch(() => {});
			tempFiles.delete(code);
		}
		return undefined;
	}
	return entry;
};

export const _consumeTempFile = async (code: string): Promise<string | undefined> => {
	const entry = tempFiles.get(code);
	if (!entry) return undefined;

	if (entry.inUse) {
		return undefined;
	}

	if (Date.now() > entry.expires) {
		fs.unlink(entry.filepath).catch(() => {});
		tempFiles.delete(code);
		return undefined;
	}

	entry.inUse = true;

	try {
		const content = await fs.readFile(entry.filepath, 'utf-8');

		try {
			await fs.unlink(entry.filepath);
		} catch (err) {
			console.error('Error deleting temp file:', err);
		}
		tempFiles.delete(code);

		return content;
	} catch (err) {
		// If reading failed, still clean up
		fs.unlink(entry.filepath).catch(() => {});
		tempFiles.delete(code);
		throw err;
	}
};
