import type { Draft } from './types';

export const emptyDraft: Draft = {
	uuid: '',
	title: '',
	shortTitle: '',
	body: '',
	meeting: '',
	demand: '',
	signMessage: '',
	requirements: '',
	merits: '',
	year: '',
	clauses: [],
	authors: [],
	whatToWho: [],
	draftType: 'motion',
	includeStatistics: false,
	numberedClauses: false
};
