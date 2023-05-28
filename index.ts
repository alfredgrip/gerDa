const express = require('express');
const path = require('path');
const uuid = require('node-uuid');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

type Clause = {
  clause: string;
  description?: string;
}
type Author = {
  name: string;
  position?: string;
}
type QueryParameters = {
  title: string;
  authors: Author[];
  meeting: string;
  body: string;
  clauses: Clause[];
  signMessage?: string;
  type?: string;
}
type QueryParametersInput = Omit<QueryParameters, 'clauses' | 'authors'> & { 
  clauses: string[] | string, 
  authors: string[] | string 
};
// Takes in query parameters
app.get('/generate', (req, res) => {
  // get query parameters
  const queryParameters: QueryParametersInput = req.query;

  if (!queryParameters.title) {
    return res.status(400).send('Missing title.');
  }
  if (!queryParameters.authors) {
    return res.status(400).send('Missing authors.');
  }
  if (!queryParameters.meeting) {
    return res.status(400).send('Missing meeting.');
  }
  if (!queryParameters.body) {
    return res.status(400).send('Missing body.');
  }
  if (!queryParameters.clauses) {
    return res.status(400).send('Missing clauses.');
  }
  if (!queryParameters.type) {
    return res.status(400).send('Missing type.');
  }
  
  let clauses: Clause[];
  try {
    clauses = Array.isArray(queryParameters.clauses) ? queryParameters.clauses.map((clauseJSON) => JSON.parse(clauseJSON)) : [JSON.parse(queryParameters.clauses)];
    if (clauses.some((clause) => !clause.clause)) {
      return res.status(400).send('Missing title in clauses.');
    }
  } catch (e) {
    return res.status(400).send('Invalid JSON in clauses.');
  }
  let authors: Author[];
  try {
    authors = Array.isArray(queryParameters.authors) ? queryParameters.authors.map((authorJSON) => JSON.parse(authorJSON)) : [JSON.parse(queryParameters.authors)];
    if (authors.some((author) => !author.name)) {
      return res.status(400).send('Missing name in authors.');
    }
  } catch (e) {
    return res.status(400).send('Invalid JSON in authors.');
  }
  // Generate file with query parameters
  const generatedTex = GENERATE__TEX({ ...queryParameters, clauses, authors });
  const uniqueFileName = `${Date.now()}-${uuid.v4()}`;
  // Write file to disk
  fs.writeFileSync(`uploads/${uniqueFileName}.tex`, generatedTex, (err) => {
    if (err) {
      return res.status(500).send('Failed to write file to disk.');
    }
  });
  // Compile file
  // Illegal solution: latexmk -f always signals error
  // so we have to ignore it by using || true
  exec(`latexmk -f uploads/${uniqueFileName}.tex || true`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Failed to compile file.');
    }
    // Move file to output folder
    exec('mv *.pdf output/ && mv *.log logs/', (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Failed to move file.');
      }
      // Clean up
      
      exec(`rm -f *.aux *.fdb_latexmk *.fls *.out *.synctex.gz uploads/${uniqueFileName}.tex`, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Failed to clean up.');
        }
        // Send file to client
        const filename = `${uniqueFileName}.pdf`;
        const filePath = path.join(__dirname, 'output', filename);
        // show pdf in browser
        res.sendFile(filePath);
      });
    });
  });
});


// Set up a route to handle file downloads
app.get('/output/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'output', filename);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(404).send('File not found.');
      }
    });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Path: index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    }
);

const GENERATE_CLAUSES = (clauses: Clause[]) => clauses.map((clause) => 
clause.description 
? `  \\ATTDESC{${clause.clause}}{${clause.description}}\n` 
: `  \\ATT{${clause.clause}}\n`)
.join('');
const GENERATE_AUTHORS = (authors: Author[], signMessage?: string) => authors.map((author, index) => `  \\signature{${index === 0 ? (signMessage ?? 'För D-sektionen, dag som ovan') : ''}}{${author.name}}{${author.position ? `${author.position}` : ''}}
`).join('');

const GENERATE__TEX = (parameters: QueryParameters) => `
\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}

\\usepackage{dsekcommon}
\\usepackage{dsekdokument}
\\usepackage[T1]{fontenc}
\\usepackage[swedish]{babel}

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

\\UNDER


\\begin{attlista}
	${GENERATE_CLAUSES(parameters.clauses)}
\\end{attlista}

${GENERATE_AUTHORS(parameters.authors, parameters.signMessage)}
\\end{document}
`