import type { StoreKey } from '$lib/store/store-keys';
import type { SupertagsStore } from '$lib/store/supertags-store';

export interface SettingsObject {
	[StoreKey.LocalstorageEnabled]: boolean;
	[StoreKey.Theme]: string;
	[StoreKey.BlockedContent]: Record<kurosearch.BlockingGroup, boolean>;
	[StoreKey.ResultColumns]: string;
	[StoreKey.Supertags]: SupertagsStore;
}

export const saveFile = async (content: string) => {
	try {
		const filename = 'kurosearch-config.json';
		if ('showSaveFilePicker' in window) {
			// @ts-expect-error - Too new, I guess
			const handle = await showSaveFilePicker({ suggestedName: filename });
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} else {
			const link = document.createElement('a');
			const file = new Blob([content], { type: 'text/plain' });
			link.href = URL.createObjectURL(file);
			link.download = filename;
			link.click();
			URL.revokeObjectURL(link.href);
		}
	} catch (err) {
		console.error(err);
	}
};

export const loadFile = async (): Promise<string> => {
	try {
		if ('showOpenFilePicker' in window) {
			// @ts-expect-error - Too new I guess
			const [handle] = await showOpenFilePicker();
			const file = await handle.getFile();
			return await file.text();
		} else {
			return await new Promise<string>((resolve, reject) => {
				const fileInput: HTMLInputElement = document.createElement('input');
				const readFile = (e: any) => {
					const file = e.target.files[0];
					if (!file) {
						reject(new Error('No file selected'));
						return;
					}
					const reader = new FileReader();
					reader.onload = (e: any) => {
						resolve(e.target.result);
						document.body.removeChild(fileInput);
					};
					reader.onerror = () => {
						reject(new Error('Failed to read file'));
						document.body.removeChild(fileInput);
					};
					reader.readAsText(file);
				};
				fileInput.type = 'file';
				fileInput.style.display = 'none';
				fileInput.onchange = readFile;
				document.body.appendChild(fileInput);
				fileInput.click();
			});
		}
	} catch (error) {
		return Promise.reject(error);
	}
};
