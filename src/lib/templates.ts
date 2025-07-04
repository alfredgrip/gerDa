import type {
	AnySchema,
	AuthorSchema,
	ClauseSchema,
	MotionSchema,
	PropositionSchema
} from '$lib/schemas';

export const generateLaTeX = (params: AnySchema): string => {
	switch (params.documentType) {
		case 'motion':
			return motionTemplate(params);
		case 'proposition':
			return propositionTemplate(params);
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
