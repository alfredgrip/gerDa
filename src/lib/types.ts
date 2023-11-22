export type DocumentType =
	| 'motion'
	| 'proposition'
	| 'electionProposal'
	| 'custom'
	| 'requirementProfile'
	| 'board-response';

export type Clause = {
	toClause: string;
	description: string | null;
};

export type Author = {
	name: string;
	position: string | null;
};

// used in election proposal (valberedningens förslag)
export type WhatToWho = {
	what: string;
	who: string[];
};
export type Statistics = {
	what: string;
	interval: string;
};

interface BasicParams {
	title: string;
	meeting: string;
	late: boolean;
	body: string;
	signMessage?: string;
	authors: Author[];
}

export interface MotionParams extends BasicParams {
	documentType: 'motion';
	clauses: Clause[];
}

export interface PropositionParams extends BasicParams {
	documentType: 'proposition';
	clauses: Clause[];
}
