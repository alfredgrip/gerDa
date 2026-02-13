import type { AnySchema } from '$lib/schemas';

export const generateFileName = (formData: AnySchema): string => {
	const sanitizedTitle = formData.title.replace(/[^a-z0-9_\-.]/gi, '_');
	const date = new Date().toISOString().slice(0, 10);
	const id = crypto.randomUUID().slice(0, 8);
	return `${formData.documentClass}-${sanitizedTitle}-${date}-${id}`;
};

export const getNaturalDocumentClass = (s: string): string => {
	switch (s) {
		case 'motion':
			return 'en motion';
		case 'proposition':
			return 'en proposition';
		case 'styrelsens-svar':
			return 'ett "styrelsens svar"';
		case 'kallelse':
			return 'en kallelse';
		case 'kravprofil':
			return 'en kravprofil';
		case 'valförslag':
			return 'ett valförslag';
		case 'handling':
			return 'en handling';
		case 'custom':
			return 'ett eget dokument';
		default:
			return s;
	}
};
