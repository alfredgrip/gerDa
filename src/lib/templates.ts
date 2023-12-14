import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';

const GENERATE_ATTLIST = (clauses: Clause[], numbered = false): string => {
	clauses = clauses.filter((clause) => clause.toClause.trim().length > 0);
	if (clauses.length <= 0) {
		return '';
	}
	const prefix = (numbered ? '\\begin{attlist}' : '\\begin{attlist*}') + '\n';
	const suffix = (numbered ? '\\end{attlist}' : '\\end{attlist*}') + '\n';
	return (
		prefix +
		clauses
			.map((clause) =>
				clause.description != null && clause.description.trim().length > 0
					? `  \\item{{${clause.toClause}}} \\begin{description} \\item {${clause.description}} \\end{description}`
					: `  \\item{{${clause.toClause}}}`
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
				`  \\signature{${index === 0 ? sm : `\\phantom{${sm}}`}}{${author.name}}{${
					author.position ?? '\\phantom{placeholder}'
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

const GENERATE_REQUIREMENTS = (requirements: string[]): string => {
	requirements = requirements.filter((requirement) => requirement.trim().length > 0);
	if (requirements.length <= 0) {
		return '';
	}
	const prefix = '\\subsection*{Krav}\n\\begin{itemize}\n';
	const suffix = '\n\\end{itemize}';
	return prefix + requirements.map((requirement) => `\\item ${requirement}`).join('\n') + suffix;
};

const GENERATE_MERITS = (merits: string[]): string => {
	merits = merits.filter((merit) => merit.trim().length > 0);
	if (merits.length <= 0) {
		return '';
	}
	const prefix = '\\subsection*{Meriterande}\\begin{itemize}';
	const suffix = '\\end{itemize}';
	return prefix + merits.map((merit) => `\\item ${merit}`).join('\n') + suffix;
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
	totalStat?: string;
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

${
	parameters.totalStat?.trim().length
		? 'Totalt antal som genomgick valprocessen: ' + parameters.totalStat
		: ''
}

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

export const GENERATE_REQUIREMENT_PROFILE = (parameters: {
	position: string;
	year: string;
	description: string | null;
	requirement: string[];
	merits: string[];
}): string =>
	`
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\usepackage{multicol}
\\settitle{Kravprofil:~${parameters.position}}
\\setshorttitle{Kravprofil}
\\setdate{${parameters.year}}
\\begin{document}

\\section*{Kravprofil:~${parameters.position}}

${parameters.description ?? ''}

\\begin{multicols}{2}

\\begin{minipage}{\\columnwidth}
${GENERATE_REQUIREMENTS(parameters.requirement)}
\\end{minipage}

\\begin{minipage}{\\columnwidth}
${GENERATE_MERITS(parameters.merits)}
\\end{minipage}

\\end{multicols}

\\end{document}
`;

export const GENERATE_BOARD_RESPONSE = (parameters: {
	title: string;
	meeting: string;
	body: string;
	demand: string;
	clauses: Clause[];
	numberedClauses: boolean;
	authors: Author[];
	signMessage?: string;
}): string => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{Styrelsens svar: ${parameters.title}}
\\setshorttitle{Styrelsens svar}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}
\\section*{\\usetitle}

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage, '')}

\\end{document}
`;
