/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    //console.log("hej från load")
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
    if (!(type === "motion" || type === "proposition" || type === "handling")) {
        console.log("invalid type")
    }
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

    if (type === "motion") {
        const motionParams: MotionParams = {
            title: title,
            authors: authorsArray,
            meeting: meeting,
            body: body,
            clauses: clausesArray,
            signMessage: signMessage
        }
        const { fileName } = await compileMotion(motionParams)
        console.log("filename from +server.ts" + fileName)
        console.log("jsonstring", JSON.stringify({ fileName: fileName }))
        const response = new Response(JSON.stringify({ fileName: fileName })
        )
        //console.log("response from +server.ts" + await response.text())
        return response
    }
    else {
        return new Response(JSON.stringify({ error: "invalid type" }))
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
type MotionParams = {
    title: string;
    authors: Author[];
    meeting: string;
    body: string;
    clauses: Clause[];
    signMessage: string;
}



async function compileMotion(params: MotionParams): Promise<{ fileName: string }> {
    console.log("hej från compileMotion")
    const { title, authors, meeting, body, clauses, signMessage } = params
    const generatedTex = GENERATE_MOTION(params)
    //console.log(generatedTex)
    const uniqueFileName = `${title.replace(/\s/g, '_')}_${Date.now()}.tex`
    fs.writeFileSync(uniqueFileName, generatedTex)
    let filePath = ""

    exec(`latexmk -f ${uniqueFileName} || true`, (err, _stdout, _stderr) => {
        if (err) {
            console.log("failed to compile")
            console.log(err)
            return { fileName: uniqueFileName }
        }
        exec(`latexmk -c ${uniqueFileName} || true`, (err, stdout, _stderr) => {
            if (err) {
                console.log("failed to clean up")
                console.log(err)
                return { fileName: uniqueFileName }
            }
            console.log(stdout)
            exec(`mv ${uniqueFileName.replace(".tex", ".pdf")} static/ || true`, (err, _stdout, _stderr) => {
                if (err) {
                    console.log("failed to move pdf")
                    console.log(err)
                    return { fileName: uniqueFileName }
                }
                const pdfFileName = uniqueFileName.replace(".tex", ".pdf")
                filePath = `static/${pdfFileName}`
                console.log(pdfFileName)
                return { fileName: pdfFileName }
            }
            )
        })
        console.log("this is the file name from server.ts " + uniqueFileName)
        return { fileName: uniqueFileName }
    }
    )
    console.log("this is the file name from server.ts " + uniqueFileName)
    return { fileName: uniqueFileName }
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

\\newcommand{\\MOTE}{${params.meeting}} % Fyll i vilket möte det gäller
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

