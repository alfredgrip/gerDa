import { error } from '@sveltejs/kit';
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
    const params = url.searchParams
    console.log(params)
    const title: string = params.get("title") ?? "no title"
    const authors: string = params.get("authors") ?? "no authors"
    const meeting: string = params.get("meeting") ?? "no meeting"
    const body: string = params.get("body") ?? "no body"
    const clauses: string = params.get("clauses") ?? "no clauses"
    const type: string = params.get("type") ?? "no type"
    const signMessage: string = params.get("signMessage") ?? "no signMessage"

    //checkValid(title, authors, meeting, body, clauses, type, signMessage)
    const authorsArray = authors?.split(",").map((author) => {
        const authorArray = author.split(":")
        return {
            name: authorArray[0],
            position: authorArray[1]
        }
    })
    const clausesArray = clauses?.split(",").map((clause) => {
        const clauseArray = clause.split(":")
        return {
            clause: clauseArray[0],
            description: clauseArray[1]
        }
    })
    let finalParams: AcceptedParams;
    const baseParams: BaseParams = {
        title,
        authors: authorsArray,
        meeting,
        body,
        signMessage
    }
    if (type === 'motion') {
        finalParams = {
            ...baseParams,
            clauses: clausesArray,
            type: 'motion'
        }
    } else if (type === 'proposition') {
        finalParams = {
            ...baseParams,
            clauses: clausesArray,
            type: 'proposition'
        }
    } else {
        throw error(400, {
            message: "Unknown type"
        })
    }
    try {
        const { fileName } = await compile(finalParams)
        console.log("filename from +server.ts" + fileName)
        console.log("jsonstring", JSON.stringify({ fileName: fileName }))
        const response = new Response(JSON.stringify({ fileName: fileName }))
        return response
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw error(500, {
            message: e
        })
    }
}


import fs from 'fs';
import { exec } from 'child_process';


type Clause = {
    clause: string;
    description?: string;
}
type Author = {
    name: string;
    position?: string;
}
type BaseParams = {
    title: string;
    authors: Author[];
    meeting: string;
    body: string;
    signMessage: string;
}
type DocumentWithClauses = BaseParams & {
    clauses: Clause[];
}
type MotionParams = DocumentWithClauses & {
    type: 'motion'
}
type PropositionParams = DocumentWithClauses & {
    type: 'proposition'
}
type AcceptedParams = MotionParams | PropositionParams;

type ResponseType = {
    fileName: string
};

function compile<T extends AcceptedParams>(params: T): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
        const { title } = params
        let generatedTex = "";
        switch (params.type) {
            case 'motion':
                generatedTex = GENERATE_MOTION(params);
                break;
            case 'proposition':
                generatedTex = GENERATE_PROPOSITION(params);
                break;
            default:
                reject("Unknown type")
                break;
        }
        const uniqueFileName = `${title.replace(/\s/g, '_')}_${Date.now()}.tex`
        fs.writeFileSync(uniqueFileName, generatedTex)

        exec(`latexmk -f ${uniqueFileName} || true`, (err, _stdout, _stderr) => {
            if (err) {
                console.log("failed to compile")
                //console.log(err)
                reject("Failed to compile")
            }
            exec(`latexmk -c ${uniqueFileName} || true`, (err, stdout, _stderr) => {
                if (err) {
                    console.log("failed to clean up")
                    //console.log(err)
                    reject("Failed to clean up")
                }
                console.log(stdout)
                exec(`mv ${uniqueFileName.replace(".tex", ".pdf")} static/ || true`, (err, _stdout, _stderr) => {
                    if (err) {
                        console.log("failed to move pdf")
                        //console.log(err)
                        reject("Failed to move pdf")
                    }
                    const pdfFileName = uniqueFileName.replace(".tex", ".pdf")
                    console.log(pdfFileName)
                    resolve({ fileName: pdfFileName })
                }
                )
            })
        }
        )
    })
}



const GENERATE_CLAUSES = (clauses: Clause[]) => clauses.map((clause) =>
    clause.description
        ? `  \\ATTDESC{${clause.clause}}{${clause.description}}\n`
        : `  \\ATT{${clause.clause}}\n`)
    .join('');
const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) => authors.map((author, index) => `  \\signature{${index === 0 ? (signMessage ?? 'För D-sektionen, dag som ovan') : ''}}{${author.name}}{${author.position ? `${author.position}` : ''}}
`).join('');

const GENERATE_MOTION = (params: MotionParams) => `
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

\\newcommand{\\MOTE}{${params.meeting} } % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${params.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\TEXT}{${params.body}} % Fyll i handlingens brödtext
\\newcommand{\\UNDER}{Undertecknad yrkar att mötet må besluta}
\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{Motion}{\\MOTE - \\YEAR}{\\PLACE, \\today}
\\title{Motion: \\TITLE}

\\begin{document}
\\section*{Motion: \\TITLE}


\\TEXT

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(params.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(params.authors, params.signMessage)}
\\end{document}
`

const GENERATE_PROPOSITION = (params: PropositionParams) => `
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

\\newcommand{\\MOTE}{${params.meeting} } % Fyll i vilket möte det gäller
\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i år
\\newcommand{\\TITLE}{${params.title}} % Fyll i titel på handlingen
\\newcommand{\\PLACE}{Lund} % Fyll i plats där handlingen skrevs, oftast bara "Lund"
\\newcommand{\\TEXT}{${params.body}} % Fyll i handlingens brödtext
\\newcommand{\\UNDER}{Undertecknad yrkar att mötet må besluta}
\\newcommand{\\ATT}[1]{\\item #1}
\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}

\\setheader{Proposition}{\\MOTE - \\YEAR}{\\PLACE, \\today}
\\title{Proposition: \\TITLE}

\\begin{document}
\\section*{Proposition: \\TITLE}


\\TEXT

\\medskip

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(params.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(params.authors, params.signMessage)}
\\end{document}
`