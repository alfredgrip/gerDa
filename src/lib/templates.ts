import type { AgendaItem, Author, Clause, Statistics, WhatToWho } from '$lib/types';

const GENERATE_ATTLIST = (clauses: Clause[], numbered = false): string => {
	clauses = clauses.filter((clause) => clause.toClause.length > 0);
	if (clauses.length <= 0) {
		return '';
	}
	const prefix = (numbered ? '\\begin{attlist}' : '\\begin{attlist*}') + '\n';
	const suffix = (numbered ? '\\end{attlist}' : '\\end{attlist*}') + '\n';
	return (
		prefix +
		clauses
			.map((clause) =>
				clause.description != null && clause.description.length > 0
					? `  \\item{{${clause.toClause}}} \\begin{description} \\item \\textit{${clause.description}} \\end{description}`
					: `  \\item{{${clause.toClause}}}`
			)
			.join('\n') +
		'\n' +
		suffix
	);
};

const GENERATE_AUTHORS = (authors: Author[]): string => {
	const authorList = authors.map((author) => {
		const sm = author.signmessage.length > 0 ? author.signmessage : '\\phantom{placeholder}';
		const signImage: string | undefined = author.signImage?.name;
		if (signImage) {
			return `\\signature[signfile=${signImage}]{${sm}}{${author.name}}{${author.position}}`;
		} else {
			return `\\signature{${sm}}{${author.name}}{${author.position}}`;
		}
	});
	// every third author should be on a new line
	// makes alignment look better
	for (let i = 0; i < authorList.length; i++) {
		if (i % 3 == 0) {
			authorList[i] = '\n' + authorList[i];
		}
	}
	return authorList.join('\n');
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
	const prefix = '\\section*{Krav}\n\\begin{itemize}\n';
	const suffix = '\n\\end{itemize}';
	return prefix + requirements.map((requirement) => `\\item ${requirement}`).join('\n') + suffix;
};

const GENERATE_MERITS = (merits: string[]): string => {
	merits = merits.filter((merit) => merit.trim().length > 0);
	if (merits.length <= 0) {
		return '';
	}
	const prefix = '\\section*{Meriterande}\\begin{itemize}';
	const suffix = '\\end{itemize}';
	return prefix + merits.map((merit) => `\\item ${merit}`).join('\n') + suffix;
};

const GENERATE_TIME_AND_PLACE = (
	meetingDate: Date,
	meetingPlace: string,
	adjournmentDate: Date | null,
	adjournmentPlace: string | null
): string => {
	const prefix = '\\section*{Tid och plats}';
	const suffix = '\n';
	const adjournment = adjournmentDate
		? `
\\textbf{Ajourneringstid:} ${adjournmentDate.toLocaleDateString('sv-SE', {
				weekday: 'long',
				day: 'numeric',
				month: 'long'
		  })} kl. ${adjournmentDate.toLocaleTimeString('sv-SE', {
				hour: 'numeric',
				minute: 'numeric'
		  })}

\\textbf{Ajourneringsplats:} ${adjournmentPlace}`
		: '';

	return (
		prefix +
		`
\\textbf{Tid:} ${meetingDate.toLocaleDateString('sv-SE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		})} kl. ${meetingDate.toLocaleTimeString('sv-SE', {
			hour: 'numeric',
			minute: 'numeric'
		})}

\\textbf{Plats:} ${meetingPlace}

${adjournment}
` +
		suffix
	);
};

const GENERATE_AGENDA = (agenda: AgendaItem[]): string => {
	const prefix = '\\section*{Föredragningslista}';
	const suffix = '\n';
	let attachmentCounter = 1;
	return (
		prefix +
		`
\\begin{agenda}
${agenda
	.map(
		(item) =>
			`  \\issue{${item.title}}${item.type ? `[${item.type}]` : '[]'}${
				item.attatchments?.length
					? '[' +
					  item.attatchments.map((a) => `\\href{${a}}{${attachmentCounter++}}`).join(', ') +
					  ']'
					: ''
			}`
	)
	.join('\n')}
\\end{agenda}
` +
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
}): string => `
\\documentclass[motion]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}

\\maketitle

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors)}

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
}): string => `
\\documentclass[proposition]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setshorttitle{Proposition}
\\setmeeting{${parameters.meeting}}

\\maketitle

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors)}

\\end{document}
`;

export const GENERATE_ELECTION_PROPOSAL = (parameters: {
	title: string;
	meeting: string;
	body?: string;
	authors: Author[];
	whatToWho: WhatToWho[];
	statistics: Statistics[];
}): string =>
	`
\\documentclass{dsekelectionproposal}
\\usepackage{dsek}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\settitle{${parameters.title}}

\\begin{document}

\\maketitle
 
${GENERATE_WHO_SECTION(parameters.whatToWho, parameters.body)}

${GENERATE_AUTHORS(parameters.authors)}

${GENERATE_STATISTICS_PAGE(parameters.statistics)}

\\end{document}
`;

export const GENERATE_CUSTOM_DOCUMENT = (parameters: {
	title: string;
	shortTitle: string;
	meeting: string;
	body: string;
	authors: Author[];
}): string => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{${parameters.title}}
\\setshorttitle{${parameters.shortTitle}}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}

\\maketitle

${parameters.body}

\\medskip

${GENERATE_AUTHORS(parameters.authors)}

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

\\maketitle

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
}): string => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{Styrelsens svar: ${parameters.title}}
\\setshorttitle{Styrelsens svar}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}

\\maketitle

${parameters.body}

\\medskip

${parameters.demand}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors)}

\\end{document}
`;

export const GENERATE_NOTICE = (parameters: {
	meeting: string;
	meetingType: string;
	meetingPlace: string;
	meetingDate: Date;
	adjournmentDate: Date | null;
	adjournmentPlace: string | null;
	agenda: Array<AgendaItem> | null;
	body: string;
	authors: Author[];
}): string => `
\\documentclass{dseknotice}
\\usepackage{dsek}
\\settitle{Kallelse till ${parameters.meetingType} ${parameters.meeting}}
\\setshorttitle{Kallelse}
\\setauthor{${parameters.authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${parameters.meeting}}
\\begin{document}

\\maketitle

${GENERATE_TIME_AND_PLACE(
	parameters.meetingDate,
	parameters.meetingPlace,
	parameters.adjournmentDate,
	parameters.adjournmentPlace
)}

\\medskip

${parameters.body ? parameters.body + ' \n\\medskip' : ''}

${parameters.agenda ? GENERATE_AGENDA(parameters.agenda) : ''}

${GENERATE_AUTHORS(parameters.authors)}

\\end{document}
`;
