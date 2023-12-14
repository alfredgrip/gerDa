import type { Author, DocumentType, WhatToWho } from '$lib/types';

export interface Clause {
	name: string;
	description?: string;
	uuid: string;
}

export interface Draft {
	uuid: string;
	title: string;
	shortTitle: string;
	body: string;
	meeting: string;
	demand: string;
	signMessage: string;
	requirements: string;
	merits: string;
	year: string;
	clauses: Clause[];
	authors: Author[];
	whatToWho: WhatToWho[];
	draftType: DocumentType;
	includeStatistics: boolean;
	totalStat: string;
	numberedClauses: boolean;
}

export const draftRoutes: DocumentType[] = [
	'motion',
	'proposition',
	'board-response',
	'election-proposal',
	'requirement-profile',
	'custom'
];

export const draftTitles: Record<DocumentType, string> = {
	motion: 'Motion',
	proposition: 'Proposition',
	'board-response': 'Styrelsens svar',
	'election-proposal': '"Valberedningens förslag"-handling',
	'requirement-profile': 'Kravprofil',
	custom: 'Eget dokument'
};
