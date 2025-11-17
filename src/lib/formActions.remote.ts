import { form } from '$app/server';
import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/templates';
import { isDocumentClass, preprocessFormData, switchOnDocumentClass } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const compilePdf = form(async (data) => {
	const formData = Object.fromEntries(data);
	console.log(formData);
	preprocessFormData(formData);
	const documentClass = formData.documentClass;
	if (!isDocumentClass(documentClass)) {
		console.error('Unknown document class:', documentClass);
		error(400, {
			message: `Unknown document class: ${documentClass}`
		});
	}
	const result = switchOnDocumentClass(documentClass, formData);
	if (!result.ok) {
		console.error(`Invalid ${documentClass} data:`, result.errors);
		error(400, {
			message: `Invalid ${documentClass} data: ` + result.errors.join(', ')
		});
	} else {
		console.log(`Valid ${documentClass} data:`, result.value);
		const filePath = await handleCompileRequest(result.value);
		return { filePath };
	}
});

export const generateTeX = form(async (data) => {
	const formData = Object.fromEntries(data);
	preprocessFormData(formData);
	const documentClass = formData.documentClass;
	if (!isDocumentClass(documentClass)) {
		console.error('Unknown document class:', documentClass);
		error(400, {
			message: `Unknown document class: ${documentClass}`
		});
	}
	const result = switchOnDocumentClass(documentClass, formData);
	if (!result.ok) {
		console.error(`Invalid ${documentClass} data:`, result.errors);
		error(400, {
			message: `Invalid ${documentClass} data: ` + result.errors.join(', ')
		});
	} else {
		console.log(`Valid ${documentClass} data:`, result.value);
		const laTeX = generateLaTeX(result.value);
		return { laTeX };
	}
});
