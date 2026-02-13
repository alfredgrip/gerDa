import type {
	AnySchema,
	AuthorSchema,
	ClauseSchema,
	CustomSchema,
	HandlingSchema,
	KallelseSchema,
	KravprofilSchema,
	MotionSchema,
	ProposalSchema,
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
		case 'handling':
			return handlingTemplate(params);
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
	console.log('authors', authors);
	const authorList = authors.map((author) => {
		const signMessage =
			author.signMessage.length > 0 ? author.signMessage : '\\phantom{placeholder}';
		const signFileName = author.signImage ? author.signImage.name : '';
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
	meetingDate: string | false,
	meetingPlace: string,
	adjournmentDate: string | false,
	adjournmentPlace: string | null | undefined
): string {
	let parsedMeetingDate = typeof meetingDate === 'string' ? new Date(meetingDate) : false;
	if (isNaN(parsedMeetingDate ? parsedMeetingDate.getTime() : NaN)) parsedMeetingDate = false;
	let parsedAdjournmentDate =
		typeof adjournmentDate === 'string' ? new Date(adjournmentDate) : false;
	if (isNaN(parsedAdjournmentDate ? parsedAdjournmentDate.getTime() : NaN))
		parsedAdjournmentDate = false;
	const prefix = '\\section*{Tid och plats}';
	const suffix = '\n';
	console.log('meetingDate:', meetingDate);
	const adjournment = parsedAdjournmentDate
		? `
\\textbf{Ajourneringstid:} ${parsedAdjournmentDate.toLocaleDateString('sv-SE', {
				weekday: 'long',
				day: 'numeric',
				month: 'long'
			})} kl. ${parsedAdjournmentDate.toLocaleTimeString('sv-SE', {
				hour: 'numeric',
				minute: 'numeric'
			})}

\\textbf{Ajourneringsplats:} ${adjournmentPlace}`
		: '';

	return (
		prefix +
		`
\\textbf{Tid:} ${
			parsedMeetingDate
				? parsedMeetingDate?.toLocaleDateString('sv-SE', {
						weekday: 'long',
						day: 'numeric',
						month: 'long'
					})
				: ''
		} kl. ${
			parsedMeetingDate
				? parsedMeetingDate?.toLocaleTimeString('sv-SE', {
						hour: 'numeric',
						minute: 'numeric'
					})
				: ''
		}

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

function proposalsTemplate(body: string, proposals: ProposalSchema[]): string {
	const prefix = (body?.trim().length ? `${body}\n` : '') + '\\begin{vemsection}';
	const suffix = '\\end{vemsection}';
	console.log('props: ', proposals);
	const result =
		prefix +
		proposals
			?.map(
				(proposal) =>
					`\\begin{vemlist}{${proposal.position}}
				${proposal.who?.map((w) => '\\item ' + w).join('\n')}
			\\end{vemlist}`
			)
			.join('\n\n') +
		'\n' +
		suffix;
	console.log('proposalsTemplate result', result);
	return result;
}

function statisticsTemplate(proposals: ProposalSchema[]): string {
	if (proposals.reduce((acc, curr) => acc + curr.statistics.trim().length, 0) < 1) {
		return '';
	}
	const prefix = '\\begin{statistikpage}';
	const suffix = '\\end{statistikpage}';
	return (
		prefix +
		proposals
			.map((proposal) => `  \\statistik{${proposal.position}}{${proposal.statistics}}\n`)
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
`.trim();
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
`.trim();
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
`.trim();
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
`.trim();
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
`.trim();
}

function valförslagTemplate({
	title,
	meeting,
	body,
	proposals,
	groupMotivation,
	demand,
	clauses,
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

${
	groupMotivation
		? `\\subsection*{Gruppmotivering}
${groupMotivation}`
		: ''
}

\\medskip

${demand}

${attListTemplate(clauses)}

\\medskip

${authorsTemplate(authors)}

${statisticsTemplate(proposals)}

\\end{document}
`.trim();
}

function handlingTemplate({ title, meeting, body, authors }: HandlingSchema): string {
	return `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\settitle{${title}}
\\setauthor{${authors[0]?.name ?? ''}}
\\setdate{\\today}
\\setmeeting{${meeting}}
\\begin{document}

\\maketitle 

${body} 

\\medskip 

${authorsTemplate(authors)} 
\\end{document}
`.trim();
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
`.trim();
}
