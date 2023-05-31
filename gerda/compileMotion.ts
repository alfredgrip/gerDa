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



function compileMotion(params: MotionParams) {
    console.log("hej från compileMotion")
    const { title, authors, meeting, body, clauses, signMessage } = params
    const generatedTex = GENERATE_MOTION(params)
    //console.log(generatedTex)
    const uniqueFileName = `${title.replace(/\s/g, '_')}_${Date.now()}.tex`
    fs.writeFileSync(uniqueFileName, generatedTex)
    let filePath = ""

    exec(`latexmk -f ${uniqueFileName} || true`, (err, stdout, stderr) => {
        if (err) {
            console.log("failed to compile")
            console.log(err)
            return ""
        }
        exec(`latexmk -c ${uniqueFileName} || true`, (err, stdout, stderr) => {
            if (err) {
                console.log("failed to clean up")
                console.log(err)
                return ""
            }
            console.log(stdout)
            exec(`mv ${uniqueFileName.replace(".tex", ".pdf")} static/ || true`, (err, stdout, stderr) => {
                if (err) {
                    console.log("failed to move pdf")
                    console.log(err)
                    return ""
                }
                const pdfFileName = uniqueFileName.replace(".tex", ".pdf")
                filePath = `static/${pdfFileName}`
                console.log(filePath)
                return filePath
            }
            )
        })
    }
    )
    
    console.log("this is the file name" + uniqueFileName)
    return {filePath: filePath, fileName: uniqueFileName}
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


    export default compileMotion;