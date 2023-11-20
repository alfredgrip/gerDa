import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';

const GENERATE_ATTLIST = (clauses: Clause[], numbered = false): string => {
	const prefix = (numbered ? '\\begin{attlist}' : '\\begin{attlist*}') + '\n';
	const suffix = (numbered ? '\\end{attlist}' : '\\end{attlist*}') + '\n';
	return (
		prefix +
		clauses
			.map((clause) =>
				clause.description != null && clause.description.trim().length > 0
					? `  \\attdesc{${clause.toClause}}{${clause.description}}`
					: `  \\att{${clause.toClause}}`
			)
			.join('\n') +
		'\n' +
		suffix
	);
};

const GENERATE_AUTHORS = (
	authors: Author[],
	signMessage?: string,
	fallBack = 'För D-sektionen, dag som ovan'
): string => {
	const sm = signMessage?.trim().length == 0 ? fallBack : signMessage;
	return authors
		.map(
			(author, index) =>
				`  \\signature{${index === 0 ? sm : '\\phantom{}'}}{${author.name}}{${
					author.position ?? ''
				}}`
		)
		.join('');
};

// Not used right now, but might be useful in the future
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GENERATE_DEMAND = (meeting: string): string => {
	if (meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)) {
		return 'Undertecknad yrkar att sektionsmötet må besluta';
	} else if (meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)) {
		return 'Undertecknad yrkar att styrelsemötet må besluta';
	} else {
		return 'Undertecknad yrkar att mötet må besluta';
	}
};

const GENERATE_WHO_SECTION = (whatToWho: WhatToWho[], body?: string): string => {
	const prefix = (body?.trim().length ? `${body}\n` : '') + '\\begin{vemsection}';
	const suffix = '\\end{vemsection}';
	return (
		prefix +
		whatToWho
			.map(
				(whatToWho) =>
					`\\begin{vemlist}{${whatToWho.what}}
				${whatToWho.who.map((who) => '\\item ' + who.replace('\r', '\n')).join('')}
			\\end{vemlist}`
			)
			.join('\n\n') +
		'\n' +
		suffix
	);
};

const GENERATE_STATISTICS_PAGE = (statistics: Statistics[]): string => {
	if (statistics.reduce((acc, curr) => acc + curr.interval.trim().length, 0) < 1) {
		return '';
	}
	const prefix = '\\begin{statistikpage}';
	const suffix = '\\end{statistikpage}';
	return (
		prefix +
		statistics
			.map((statistics) => `  \\statistik{${statistics.what}}{${statistics.interval}}\n`)
			.join('') +
		suffix
	);
};

export const GENERATE_MOTION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	demand: string;
	clauses: Clause[];
	numberedClauses: boolean;
	authors: Author[];
	signMessage?: string;
}): string => `
\\documentclass[motion]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage, 'För D-sektionen, dag som ovan')}

\\end{document}
`;

export const GENERATE_PROPOSITION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	demand: string;
	clauses: Clause[];
	numberedClauses: boolean;
	authors: Author[];
	signMessage?: string;
}): string => `
\\documentclass[proposition]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setshorttitle{Proposition}
\\setmeeting{${parameters.meeting}}

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage, 'För D-sektionen, dag som ovan')}

\\end{document}
`;

export const GENERATE_ELECTION_PROPOSAL = (parameters: {
	meeting: string;
	body?: string;
	authors: Author[];
	whatToWho: WhatToWho[];
	statistics: Statistics[];
	signMessage?: string;
}): string =>
	`
\\documentclass{dsekelectionproposal}
\\usepackage{dsek}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}
 
${GENERATE_WHO_SECTION(parameters.whatToWho, parameters.body)}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage, 'För Valberedningen')}

${GENERATE_STATISTICS_PAGE(parameters.statistics)}

\\end{document}
`;

export const GENERATE_CUSTOM_DOCUMENT = (parameters: {
	title: string;
	shortTitle: string;
	meeting: string;
	body: string;
	authors: Author[];
	signMessage?: string;
}): string => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{${parameters.title}}
\\setshorttitle{${parameters.shortTitle}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}
\\section*{\\usetitle}

${parameters.body}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage, '')}

\\end{document}
`;
