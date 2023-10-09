export type Clause = {
	toClause: string;
	description: string | null;
};

export type Author = {
	name: string;
	position: string | null;
};

// used in nomination committee proposal (valberedningens förslag)
export type WhatToWho = {
	what: string;
	who: string[];
};
export type Statistics = {
	what: string;
	interval: string;
};
