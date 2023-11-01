import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';

// export const GENERATE_MOTION = (parameters: {
// 	meeting: string;
// 	title: string;
// 	body: string;
// 	clauses: Clause[];
// 	authors: Author[];
// 	signMessage?: string;
// 	late: boolean;
// 	markdown: boolean;
// }) => `
// \\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

// \\usepackage{dsekcommon}
// \\usepackage{dsekdokument}
// \\usepackage[T1]{fontenc}
// %\\usepackage[utf8]{inputenc}
// \\usepackage[swedish]{babel}
// \\usepackage{markdown}
// \\usepackage{csquotes}

// % this enables lth-symbols
// %\\pdfgentounicode=0

// \\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
// \\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
// \\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
// \\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
// \\newcommand{\\UNDER}{${
// 	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
// 		? 'Undertecknad yrkar att sektionsmötet må besluta'
// 		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
// 		? 'Undertecknad yrkar att styrelsemötet må besluta'
// 		: 'Undertecknad yrkar att mötet må besluta'
// }}
// }}
// \\newcommand{\\ATT}[1]{\\item #1}
// \\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

// \\setheader{${parameters.late ? 'Sen motion' : 'Motion'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
// \\title{${parameters.late ? 'Sen motion' : 'Motion'}: \\TITLE}

// \\begin{document}
// \\section*{${'Motion'}: \\TITLE}

// ${GENERATE_BODY(parameters.body, parameters.markdown)}

// \\medskip

// \\UNDER

// \\begin{attlista}
// 	${GENERATE_CLAUSES(parameters.clauses)}
// \\end{attlista}

// ${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
// \\end{document}
// `;

// export const GENERATE_PROPOSITION = (parameters: {
// 	meeting: string;
// 	title: string;
// 	body: string;
// 	clauses: Clause[];
// 	authors: Author[];
// 	signMessage?: string;
// 	late: boolean;
// 	markdown: boolean;
// }) => `
// \\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

// \\usepackage{dsekcommon}
// \\usepackage{dsekdokument}
// \\usepackage[T1]{fontenc}
// %\\usepackage[utf8]{inputenc}
// \\usepackage[swedish]{babel}
// \\usepackage{markdown}
// \\usepackage{csquotes}

// % this enables lth-symbols
// \\pdfgentounicode=0

// \\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
// \\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
// \\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
// \\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
// \\newcommand{\\UNDER}{${
// 	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
// 		? 'Undertecknad yrkar att sektionsmötet må besluta'
// 		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
// 		? 'Undertecknad yrkar att styrelsemötet må besluta'
// 		: 'Undertecknad yrkar att mötet må besluta'
// }}
// }}
// \\newcommand{\\ATT}[1]{\\begin{markdown}\\item #1\\end{markdown}}
// \\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

// \\setheader{${
// 	parameters.late ? 'Sen proposition' : 'Proposition'
// }}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
// \\title{${parameters.late ? 'Sen proposition' : 'Proposition'}: \\TITLE}

// \\begin{document}
// \\section*{${'Proposition'}: \\TITLE}

// ${GENERATE_BODY(parameters.body, parameters.markdown)}

// \\medskip

// \\UNDER

// \\begin{attlista}
// 	${GENERATE_CLAUSES(parameters.clauses)}
// \\end{attlista}

// ${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
// \\end{document}
// `;

// export const GENERATE_ELECTION_PROPOSAL = (parameters: {
// 	meeting: string;
// 	body: string;
// 	authors: Author[];
// 	whatToWho: WhatToWho[];
// 	statistics: Statistics[];
// 	signMessage?: string;
// 	late: boolean;
// 	markdown: boolean;
// }) => `
// \\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

// \\usepackage{dsekcommon}
// \\usepackage{dsekdokument}
// \\usepackage[T1]{fontenc}
// %\\usepackage[utf8]{inputenc}
// \\usepackage[swedish]{babel}
// \\usepackage{multicol}
// \\usepackage{markdown}
// \\usepackage{csquotes}

// \\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
// \\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
// \\newcommand{\\TITLE}{Valberedningens förslag inför \\MOTE} % Fyll i titel på motionen
// \\newcommand{\\PLACE}{Lund} % Fyll i plats där motionen skrevs, oftast bara "Lund"
// \\newcommand{\\WHATWHO}[2]{\\subsubsection*{#1}#2}
// \\newcommand{\\WHATCOUNT}[2]{\\subsubsection*{#1}#2 st}

// \\setheader{${parameters.late ? 'Sen handling' : 'Handling'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
// \\title{${parameters.late ? 'Sen handling' : 'Handling'}: \\TITLE}

// \\begin{document}
// \\section*{Valberedningens förslag inför \\MOTE}

// ${GENERATE_BODY(parameters.body, parameters.markdown)}

// Valberedningens förslag inför \\MOTE \\ är följande:
// \\begin{multicols*}{2}

// ${GENERATE_WHAT_TO_WHO(parameters.whatToWho)}

// \\end{multicols*}

// \\medskip

// {Valstatistik presenteras på nästkommande sida.\\newline}

// \\medskip

// ${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

// \\newpage
// \\subsection*{Valstatistik}
// Nedan presenteras antalet personer som genomgick valprocessen i intervall om storlek 5.

// \\begin{multicols}{2}

// ${GENERATE_STATISTICS(parameters.statistics)}

// \\end{multicols}

// \\end{document}
// `;

// const GENERATE_BODY = (body: string, markdown: boolean) => {
// 	if (markdown) {
// 		return `
// \\begin{markdown}
// ${body}
// \\end{markdown}`;
// 	}
// 	return body;
// };

const GENERATE_ATTLIST = (clauses: Clause[], numbered = false) => {
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

const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) => {
	const sm = signMessage?.trim().length == 0 ? 'För D-sektionen, dag som ovan' : signMessage;
	return authors
		.map(
			(author, index) =>
				`  \\signature{${index === 0 ? sm : '\\phantom{}'}}{${author.name}}{${
					author.position ?? ''
				}}`
		)
		.join('');
};

const GENERATE_DEMAND = (meeting: string) => {
	if (meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)) {
		return 'Undertecknad yrkar att sektionsmötet må besluta';
	} else if (meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)) {
		return 'Undertecknad yrkar att styrelsemötet må besluta';
	} else {
		return 'Undertecknad yrkar att mötet må besluta';
	}
};

const GENERATE_WHAT_TO_WHO = (whatToWho: WhatToWho[]) =>
	whatToWho
		.map(
			(whatToWho) => `  \\WHATWHO{${whatToWho.what}}{${whatToWho.who.join('\\newline')}}\\newline`
		)
		.join('\\newline');

const GENERATE_STATISTICS = (statistics: Statistics[]) =>
	statistics
		.map((statistics) => `  \\WHATCOUNT{${statistics.what}}{${statistics.interval}}\n`)
		.join('');

export const NEW_GENERATE_MOTION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	numberedClauses: boolean;
	authors: Author[];
	signMessage?: string;
}) => `
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

${GENERATE_DEMAND(parameters.meeting)}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\end{document}
`;

export const NEW_GENERATE_PROPOSITION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	numberedClauses: boolean;
	authors: Author[];
	signMessage?: string;
}) => `
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

${GENERATE_DEMAND(parameters.meeting)}

${GENERATE_ATTLIST(parameters.clauses, parameters.numberedClauses)}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\end{document}
`;

export const NEW_GENERATE_ELECTION_PROPOSAL = (parameters: {
	meeting: string;
	body: string;
	authors: Author[];
	whatToWho: WhatToWho[];
	statistics: Statistics[];
	signMessage?: string;
}) => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\usepackage{longtable}
\\usepackage{booktabs}

\\begin{document}
\\settitle{Valberedningens förslag inför ${parameters.meeting}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setshorttitle{'Handling'}
\\setmeeting{${parameters.meeting}}
\\newcommand{\\WHATWHO}[2]{\\textbf{#1}\\newline #2\\newline\\newline}
\\newcommand{\\WHATCOUNT}[2]{\\textbf{#1}#2 st}



\\section*{Valberedningens förslag inför ${parameters.meeting}}
${parameters.body}

Valberedningens förslag inför \\MOTE \\ är följande:
\\begin{multicols*}{2}  

${GENERATE_WHAT_TO_WHO(parameters.whatToWho)}

\\end{multicols*}

\\medskip

{Valstatistik presenteras på nästkommande sida.\\newline}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\newpage
\\subsection*{Valstatistik}
Nedan presenteras antalet personer som genomgick valprocessen i intervall om storlek 5.

\\begin{multicols}{2}

${GENERATE_STATISTICS(parameters.statistics)}

\\end{multicols}

\\end{document}
`;
