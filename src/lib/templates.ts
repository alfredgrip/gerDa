import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';

export const GENERATE_MOTION = (parameters: {
	meeting: string;
	title: string;
	body: string;
	clauses: Clause[];
	authors: Author[];
	signMessage?: string;
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
%\\usepackage{tabularx}
\\usepackage[T1]{fontenc}
%\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
%\\usepackage{url}
%\\usepackage[dvipsnames]{xcolor}

% this enables lth-symbols
%\\pdfgentounicode=0

\\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\TEXT}{${parameters.body}} % Fyll i handlingens brödtext
\\newcommand{\\UNDER}{Undertecknad yrkar att mötet må besluta}
\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{${'Motion'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{${'Motion'}: \\TITLE}

\\begin{document}
\\section*{${'Motion'}: \\TITLE}


\\TEXT

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
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage{tabularx}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
\\usepackage{url}
\\usepackage[dvipsnames]{xcolor}

% this enables lth-symbols
\\pdfgentounicode=0

\\newcommand{\\MOTE}{${parameters.meeting}} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${parameters.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\TEXT}{${parameters.body}} % Fyll i handlingens brödtext
\\newcommand{\\UNDER}{Undertecknad yrkar att mötet må besluta}
\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{${'Proposition'}}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{${'Proposition'}: \\TITLE}

\\begin{document}
\\section*{${'Proposition'}: \\TITLE}


\\TEXT

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`;

export const GENERATE_ELECTION_COMMITTEE_PROPOSAL = (parameters: {
	meeting: string;
	title: string;
	body: string;
	authors: Author[];
	whatToWho: WhatToWho[];
	statistics: Statistics[];
	signMessage?: string;
}) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage[T1]{fontenc}
%\\usepackage[utf8]{inputenc}
\\usepackage[swedish]{babel}
\\usepackage{multicol}


\\newcommand{\\MOTE}{HTM-val} % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{2023} % Fyll i år
\\newcommand{\\TITLE}{Valberedningens förslag inför \\MOTE} % Fyll i titel på motionen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där motionen skrevs, oftast bara "Lund"
\\newcommand{\\UNDER}{För Valberedningen}
\\newcommand{\\WHATWHO}[2]{\\subsubsection*{#1}#2}
\\newcommand{\\WHATCOUNT}[2]{\\subsubsection*{#1}#2 st}

\\setheader{Handling}{\\MOTE\\ - \\YEAR}{\\PLACE, \\today}
\\title{Handling: \\TITLE}

\\begin{document}
\\section*{Valberedningens förslag inför \\MOTE}

Valberedningens förslag inför \\MOTE \\ är följande:
\\begin{multicols}{2}  

${GENERATE_WHAT_TO_WHO(parameters.whatToWho)}

\\end{multicols}

{Valstatistik presenteras på nästkommande sida.\\newline}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}

\\newpage
\\subsection*{Valstatistik}
Nedan presenteras antalet personer som genomgick valprocessen i intervall om storlek 5.

\\begin{multicols}{2}

${GENERATE_STATISTICS(parameters.statistics)}

\\end{multicols}

\\end{document}
`;

const GENERATE_CLAUSES = (clauses: Clause[]) =>
	clauses
		.map((clause) =>
			clause.description
				? `  \\ATTDESC{${clause.toClause}}{${clause.description}}\n`
				: `  \\ATT{${clause.toClause}}\n`
		)
		.join('');
const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) =>
	authors
		.map(
			(author, index) =>
				`  \\signature{${index === 0 ? signMessage ?? 'För D-sektionen, dag som ovan' : ''}}{${
					author.name
				}}{${author.position ? `${author.position}` : ''}}`
		)
		.join('');

const GENERATE_WHAT_TO_WHO = (whatToWho: WhatToWho[]) =>
	whatToWho
		.map((whatToWho) => `  \\WHATWHO{${whatToWho.what}}{${whatToWho.who.join('\\newline')}}\n`)
		.join('');

const GENERATE_STATISTICS = (statistics: Statistics[]) =>
	statistics
		.map((statistics) => `  \\WHATCOUNT{${statistics.what}}{${statistics.interval}}\n`)
		.join('');
