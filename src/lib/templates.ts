import type {
	AnySchema,
	AuthorSchema,
	ClauseSchema,
	CustomSchema,
	KallelseSchema,
	KravprofilSchema,
	MotionSchema,
	PropositionSchema,
	StyrelsensSvarSchema,
	ValförslagSchema
} from '$lib/schemas';

export const generateLaTeX = (params: AnySchema): string => {
	switch (params.documentClass) {
		case 'motion':
			return motionTemplate(params);
		case 'proposition':
			return propositionTemplate(params);
		case 'styrelsens-svar':
			return styrelsensSvarTemplate(params);
		case 'kallelse':
			return kallelseTemplate(params);
		case 'kravprofil':
			return kravprofilTemplate(params);
		case 'valförslag':
			return valförslagTemplate(params);
		case 'custom':
			return customTemplate(params);
	}
};

function attListTemplate(clauses: ClauseSchema[]): string {
	clauses = clauses.filter((clause) => clause.toClause.length > 0);
	if (clauses.length <= 0) {
		return '';
	}
	const prefix = '\\begin{attlist}\n';
	const suffix = '\\end{attlist}\n';
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
}

function authorsTemplate(authors: AuthorSchema[]): string {
	const authorList = authors.map((author) => {
		const signMessage =
			author.signMessage.length > 0 ? author.signMessage : '\\phantom{placeholder}';
		const signFileName = author.signImage?.name ?? '';
		return `\\signature${signFileName ? `[signfile={${signFileName}}]` : ''}{${signMessage}}{${author.name}}{${author.position}}`;
	});
	// every third author should be on a new line
	// makes alignment look better
	for (let i = 0; i < authorList.length; i++) {
		if (i % 3 == 0) {
			authorList[i] = '\n' + authorList[i];
		}
	}
	return authorList.join('\n');
}

function agendaTemplate(
	agenda: Array<{ title: string; type?: string; attachments?: string[] }>
): string {
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
				item.attachments?.length
					? '[' +
						item.attachments.map((a) => `\\href{${a}}{${attachmentCounter++}}`).join(', ') +
						']'
					: ''
			}`
	)
	.join('\n')}
\\end{agenda}
` +
		suffix
	);
}

function timeAndPlaceTemplate(
	meetingDate: Date | null | undefined,
	meetingPlace: string,
	adjournmentDate: Date | null | undefined,
	adjournmentPlace: string | null | undefined
): string {
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
\\textbf{Tid:} ${meetingDate?.toLocaleDateString('sv-SE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		})} kl. ${meetingDate?.toLocaleTimeString('sv-SE', {
			hour: 'numeric',
			minute: 'numeric'
		})}

\\textbf{Plats:} ${meetingPlace}

${adjournment}
` +
		suffix
	);
}

function requirementsTemplate(requirements: string[]): string {
	requirements = requirements.filter((requirement) => requirement.trim().length > 0);
	if (requirements.length <= 0) {
		return '';
	}
	const prefix = '\\section*{Krav}\n\\begin{itemize}\n';
	const suffix = '\n\\end{itemize}';
	return prefix + requirements.map((requirement) => `\\item ${requirement}`).join('\n') + suffix;
}

function meritsTemplate(merits: string[]): string {
	merits = merits.filter((merit) => merit.trim().length > 0);
	if (merits.length <= 0) {
		return '';
	}
	const prefix = '\\section*{Meriterande}\\begin{itemize}';
	const suffix = '\\end{itemize}';
	return prefix + merits.map((merit) => `\\item ${merit}`).join('\n') + suffix;
}

function proposalsTemplate(
	body: string,
	proposals: Array<{ who: string[]; what: string }>
): string {
	const prefix = (body?.trim().length ? `${body}\n` : '') + '\\begin{vemsection}';
	const suffix = '\\end{vemsection}';
	return (
		prefix +
		proposals
			.map(
				(proposal) =>
					`\\begin{vemlist}{${proposal.what}}
				${proposal.who.map((who) => '\\item ' + who.replace('\r', '\n')).join('')}
			\\end{vemlist}`
			)
			.join('\n\n') +
		'\n' +
		suffix
	);
}

function statisticsTemplate(statistics: Array<{ what: string; interval: string }>): string {
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
}

function motionTemplate({ title, meeting, body, demand, clauses, authors }: MotionSchema): string {
	return `
\\documentclass[motion]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${title}}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}

\\maketitle

${body}

\\medskip

${demand}

${attListTemplate(clauses)}

\\medskip

${authorsTemplate(authors)}

\\end{document}
`;
}

function propositionTemplate({
	title,
	meeting,
	body,
	demand,
	clauses,
	authors
}: PropositionSchema): string {
	return `
\\documentclass[proposition]{dsekmotion}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{${title}}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setshorttitle{Proposition}
\\setmeeting{${meeting}}

\\maketitle

${body}

\\medskip

${demand}

${attListTemplate(clauses)}

\\medskip

${authorsTemplate(authors)}

\\end{document}
`;
}

function styrelsensSvarTemplate({
	title,
	meeting,
	body,
	demand,
	clauses,
	authors
}: StyrelsensSvarSchema): string {
	return `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{Styrelsens svar: ${title}}
\\setshorttitle{Styrelsens svar}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}
\\begin{document}

\\maketitle

${body}

\\medskip

${demand}

${attListTemplate(clauses)}

\\medskip

${authorsTemplate(authors)}

\\end{document}
`;
}

function kallelseTemplate({
	meeting,
	meetingType,
	meetingPlace,
	meetingDate,
	adjournmentDate,
	adjournmentPlace,
	agenda,
	body,
	authors
}: KallelseSchema): string {
	return `
\\documentclass{dseknotice}
\\usepackage{dsek}
\\settitle{Kallelse till ${meetingType} ${meeting}}
\\setshorttitle{Kallelse}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}
\\begin{document}

\\maketitle

${timeAndPlaceTemplate(meetingDate, meetingPlace, adjournmentDate, adjournmentPlace)}

\\medskip

${body ? body + ' \n\\medskip' : ''}

${agenda?.length ? agendaTemplate(agenda) : ''}

${authorsTemplate(authors)}

\\end{document}
`;
}

function kravprofilTemplate({
	position,
	year,
	description,
	requirements,
	merits
}: KravprofilSchema): string {
	return `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\usepackage{multicol}
\\settitle{Kravprofil:~${position}}
\\setshorttitle{Kravprofil}
\\setdate{${year}}
\\begin{document}

\\maketitle

${description ?? ''}

\\begin{multicols}{2}

\\begin{minipage}{\\columnwidth}
${requirementsTemplate(requirements)}
\\end{minipage}

\\begin{minipage}{\\columnwidth}
${meritsTemplate(merits)}
\\end{minipage}

\\end{multicols}

\\end{document}
`;
}

function valförslagTemplate({
	title,
	meeting,
	body,
	proposals,
	statistics,
	authors
}: ValförslagSchema): string {
	return `
\\documentclass{dsekelectionproposal}
\\usepackage{dsek}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}
\\settitle{${title}}

\\begin{document}

\\maketitle

${proposalsTemplate(body, proposals)}

${authorsTemplate(authors)}

${statisticsTemplate(statistics)}

\\end{document}`;
}

function customTemplate({ title, shortTitle, meeting, body, authors }: CustomSchema): string {
	return `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{${title}}
\\setshorttitle{${shortTitle}}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}
\\begin{document}

\\maketitle

${body}

\\medskip

${authorsTemplate(authors)}

\\end{document}
`;
}
