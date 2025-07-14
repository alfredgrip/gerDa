import { motionSchema, validate } from '$lib/schemas';
import { expect, test } from 'vitest';

test('validate function', () => {
	const validData = {
		documentClass: 'motion',
		title: 'Test Motion',
		meeting: '2023-10-01',
		body: 'Jag tycker det sjungs alldeles för lite på sektionen.',
		demand: 'Undertecknad yrkar att mötet må besluta',
		clauses: [{ toClause: 'sjunga mer' }],
		authors: [
			{
				name: 'Råsa Pantern',
				position: 'LaTeX Expert',
				signMessage: 'Lund, dag som ovan'
			}
		]
	};

	const noAuthors = {
		documentClass: 'motion',
		title: 'Test Motion',
		meeting: '2023-10-01',
		body: 'Jag tycker det sjungs alldeles för lite på sektionen.',
		demand: 'Undertecknad yrkar att mötet må besluta',
		clauses: [{ toClause: 'sjunga mer', description: 'för det är kul' }],
		authors: []
	};

	const noClauses = {
		documentClass: 'motion',
		title: 'Test Motion',
		meeting: '2023-10-01',
		body: 'Jag tycker det sjungs alldeles för lite på sektionen.',
		demand: 'Undertecknad yrkar att mötet må besluta',
		clauses: [],
		authors: [
			{
				name: 'Råsa Pantern',
				position: 'LaTeX Expert',
				signMessage: 'Lund, dag som ovan',
				signImage: null,
				path: null
			}
		]
	};

	expect(validate(validData, motionSchema).ok).toBe(true);
	expect(validate(noAuthors, motionSchema).ok).toBe(false);
	expect(validate(noClauses, motionSchema).ok).toBe(false);
});
