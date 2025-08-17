// import {
// 	customSchema,
// 	kallelseSchema,
// 	kravprofilSchema,
// 	motionSchema,
// 	propositionSchema,
// 	styrelsensSvarSchema,
// 	valförslagSchema,
// 	validate,
// 	type AuthorSchema,
// 	type ClauseSchema,
// 	type DocumentClass
// } from '$lib/schemas';
// import { generateLaTeX } from '$lib/templates';
// import {
// 	handleCompileRequest,
// 	isDocumentClass,
// 	preprocessFormData,
// 	switchOnDocumentClass
// } from '$lib/utils.svelte';
// import { error } from '@sveltejs/kit';
// import type { Actions } from './$types';

// export const actions: Actions = {
// 	compile: async (event): Promise<{ result: string }> | never => {
// 		const formData = Object.fromEntries(await event.request.formData());
// 		preprocessFormData(formData);
// 		console.log('Compile action called with formData:', formData);
// 		const documentClass = formData.documentClass;
// 		if (!isDocumentClass(documentClass)) {
// 			console.error('Unknown document class:', documentClass);
// 			error(400, {
// 				message: `Unknown document class: ${documentClass}`
// 			});
// 		}
// 		const result = switchOnDocumentClass(documentClass, formData);
// 		if (!result.ok) {
// 			console.error(`Invalid ${documentClass} data:`, result.errors);
// 			error(400, {
// 				message: `Invalid ${documentClass} data: ` + result.errors.join(', ')
// 			});
// 		} else {
// 			console.log(`Valid ${documentClass} data:`, result.value);
// 			return { result: await handleCompileRequest(result.value) };
// 		}
// 	},
// 	getTeX: async (event): Promise<{ result: string }> | never => {
// 		console.log('getTeX action called');
// 		const formData = Object.fromEntries(await event.request.formData());
// 		preprocessFormData(formData);
// 		const documentClass = formData.documentClass;
// 		if (!isDocumentClass(documentClass)) {
// 			console.error('Unknown document class:', documentClass);
// 			error(400, {
// 				message: `Unknown document class: ${documentClass}`
// 			});
// 		}
// 		const result = switchOnDocumentClass(documentClass, formData);
// 		if (!result.ok) {
// 			console.error(`Invalid ${documentClass} data:`, result.errors);
// 			error(400, {
// 				message: `Invalid ${documentClass} data: ` + result.errors.join(', ')
// 			});
// 		} else {
// 			console.log(`Valid ${documentClass} data:`, result.value);
// 			return { result: generateLaTeX(result.value) };
// 		}
// 	}
// };
