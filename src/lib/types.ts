export type DocumentType =
	| 'motion'
	| 'proposition'
	| 'electionProposal'
	| 'custom'
	| 'requirementProfile';

export type Clause = {
	toClause: string;
	description: string | null;
};

export type Author = {
	name: string;
	position: string;
	uuid: string;
};

// used in election proposal (valberedningens förslag)
export type WhatToWho = {
	what: string;
	who: string[];
	numberOfApplicants: string;
	uuid: string;
	whoString: string;
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
