import { Author, Clause, QueryParameters } from "./types";

export const GENERATE_MOTION = (parameters: QueryParameters) => `
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

\\setheader{${parameters.type ?? 'Motion'}}{\\MOTE - \\YEAR}{\\PLACE, \\today}
\\title{${parameters.type ?? 'Motion'}: \\TITLE}

\\begin{document}
\\section*{${parameters.type ?? 'Motion'}: \\TITLE}


\\TEXT

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`

export const GENERATE_PROPOSITION = (parameters: QueryParameters) => `
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

\\setheader{${parameters.type ?? 'Proposition'}}{\\MOTE - \\YEAR}{\\PLACE, \\today}
\\title{${parameters.type ?? 'Proposition'}: \\TITLE}

\\begin{document}
\\section*{${parameters.type ?? 'Proposition'}: \\TITLE}


\\TEXT

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`

const GENERATE_CLAUSES = (clauses: Clause[]) => clauses.map((clause) => 
clause.description 
? `  \\ATTDESC{${clause.clause}}{${clause.description}}\n` 
: `  \\ATT{${clause.clause}}\n`)
.join('');
const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) => authors.map((author, index) => `  \\signature{${index === 0 ? (signMessage ?? 'För D-sektionen, dag som ovan') : ''}}{${author.name}}{${author.position ? `${author.position}` : ''}}
`).join('');