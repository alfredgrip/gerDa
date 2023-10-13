import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';

export const GENERATE_MOTION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	authors: Author[];
	signMessage?: string;
	late: boolean;
	markdown: boolean;
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage[T1]{fontenc}
%\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
\\usepackage{markdown}
\\usepackage{csquotes}


% this enables lth-symbols
%\\pdfgentounicode=0

\\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\UNDER}{${
	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
		? 'Undertecknad yrkar att sektionsmötet må besluta'
		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
		? 'Undertecknad yrkar att styrelsemötet må besluta'
		: 'Undertecknad yrkar att mötet må besluta'
}}
}}
\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{${parameters.late ? 'Sen motion' : 'Motion'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{${parameters.late ? 'Sen motion' : 'Motion'}: \\TITLE}

\\begin{document}
\\section*{${'Motion'}: \\TITLE}

${GENERATE_BODY(parameters.body, parameters.markdown)}

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`;

export const GENERATE_PROPOSITION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	authors: Author[];
	signMessage?: string;
	late: boolean;
	markdown: boolean;
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage[T1]{fontenc}
%\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
\\usepackage{markdown}
\\usepackage{csquotes}

% this enables lth-symbols
\\pdfgentounicode=0

\\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\UNDER}{${
	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
		? 'Undertecknad yrkar att sektionsmötet må besluta'
		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
		? 'Undertecknad yrkar att styrelsemötet må besluta'
		: 'Undertecknad yrkar att mötet må besluta'
}}
}}
\\newcommand{\\ATT}[1]{\\begin{markdown}\\item #1\\end{markdown}}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{${
	parameters.late ? 'Sen proposition' : 'Proposition'
}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{${parameters.late ? 'Sen proposition' : 'Proposition'}: \\TITLE}

\\begin{document}
\\section*{${'Proposition'}: \\TITLE}


${GENERATE_BODY(parameters.body, parameters.markdown)}

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`;

export const GENERATE_ELECTION_PROPOSAL = (parameters: {
	meeting: string;
	body: string;
	authors: Author[];
	whatToWho: WhatToWho[];
	statistics: Statistics[];
	signMessage?: string;
	late: boolean;
	markdown: boolean;
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage[T1]{fontenc}
%\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
\\usepackage{multicol}
\\usepackage{markdown}
\\usepackage{csquotes}


\\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{Valberedningens förslag inför \\MOTE} % Fyll i titel på motionen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där motionen skrevs, oftast bara "Lund"
\\newcommand{\\WHATWHO}[2]{\\subsubsection*{#1}#2}
\\newcommand{\\WHATCOUNT}[2]{\\subsubsection*{#1}#2 st}

\\setheader{${parameters.late ? 'Sen handling' : 'Handling'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{${parameters.late ? 'Sen handling' : 'Handling'}: \\TITLE}

\\begin{document}
\\section*{Valberedningens förslag inför \\MOTE}

${GENERATE_BODY(parameters.body, parameters.markdown)}

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

const GENERATE_BODY = (body: string, markdown: boolean) => {
	if (markdown) {
		return `
\\begin{markdown}
${body}
\\end{markdown}`;
	}
	return body;
};

const GENERATE_CLAUSES = (clauses: Clause[]) =>
	clauses
		.map((clause) =>
			clause.description
				? `  \\ATTDESC{${clause.toClause
						.replaceAll(RegExp(/"([^"]*)"/g), '\\enquote{$1}')
						.replaceAll('\n', '\\\\')}}{${clause.description
						.replaceAll(RegExp(/"([^"]*)"/g), '\\enquote{$1}')
						.replaceAll('\n', '\\\\')}}\n`
				: `  \\ATT{${clause.toClause
						.replaceAll(RegExp(/"([^"]*)"/g), '\\enquote{$1}')
						.replaceAll('\n', '\\\\')}}\n`
		)
		.join('');
const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) =>
	authors
		.map(
			(author, index) =>
				`  \\signature{${
					index === 0 ? signMessage ?? 'För D-sektionen, dag som ovan' : '\\phantom{}'
				}}{${author.name}}{${author.position ? `${author.position}` : ''}}`
		)
		.join('');

const GENERATE_WHAT_TO_WHO = (whatToWho: WhatToWho[]) =>
	whatToWho
		.map((whatToWho) => `  \\WHATWHO{${whatToWho.what}}{${whatToWho.who.join('\\\\')}}\\\\`)
		.join('');

// .map(
// 	(whatToWho) => `  \\WHATWHO{${whatToWho.what}}{
// 	\\begin{itemize}
// 	${whatToWho.who.map((who) => `\\item ${who}`).join('\n')}
// \\end{itemize}}\n`
// )

const GENERATE_STATISTICS = (statistics: Statistics[]) =>
	statistics
		.map((statistics) => `  \\WHATCOUNT{${statistics.what}}{${statistics.interval}}\n`)
		.join('');

export const NEW_GENERATE_MOTION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	authors: Author[];
	signMessage?: string;
	late: boolean;
}) => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\usepackage{array}
\\usepackage{fontspec}
\\usepackage{polyglossia}
\\usepackage{calc}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{lastpage}


\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setshorttitle{${parameters.late ? 'Sen motion' : 'Motion'}}
\\setmeeting{${parameters.meeting}}

\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\section*{${parameters.late ? 'Sen motion' : 'Motion'}: \\usetitle}
${parameters.body}

\\medskip

${
	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
		? 'Undertecknad yrkar att sektionsmötet må besluta'
		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
		? 'Undertecknad yrkar att styrelsemötet må besluta'
		: 'Undertecknad yrkar att mötet må besluta'
}

\\begin{attlist}
${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlist}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\end{document}
`;

export const NEW_GENERATE_PROPOSITION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	authors: Author[];
	signMessage?: string;
	late: boolean;
	markdown: boolean;
}) => `
\\documentclass{dsekdoc}
\\usepackage{dsek}
\\usepackage{array}
\\usepackage{fontspec}
\\usepackage{polyglossia}
\\usepackage{calc}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{lastpage}


\\begin{document}
\\settitle{${parameters.title}}
\\setauthor{${parameters.authors[0].name}}
\\setdate{\\today}
\\setshorttitle{${parameters.late ? 'Sen proposition' : 'Proposition'}}
\\setmeeting{${parameters.meeting}}

\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\section*{${parameters.late ? 'Sen proposition' : 'Proposition'}: \\usetitle}
${parameters.body}

\\medskip

${
	parameters.meeting.toLocaleUpperCase().match(/^(VTM|HTM)/)
		? 'Undertecknad yrkar att sektionsmötet må besluta'
		: parameters.meeting.toLocaleUpperCase().match(/^(S[0-9]+)/)
		? 'Undertecknad yrkar att styrelsemötet må besluta'
		: 'Undertecknad yrkar att mötet må besluta'
}

\\begin{attlist}
${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlist}

\\medskip

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\end{document}
`;
