var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var express = require('express');
var path = require('path');
var uuid = require('node-uuid');
var exec = require('child_process').exec;
var fs = require('fs');
var app = express();
var port = 3000;
// Takes in query parameters
app.get('/generate', function (req, res) {
    // get query parameters
    var queryParameters = req.query;
    if (!queryParameters.title
        || !queryParameters.authors
        || !queryParameters.meeting
        || !queryParameters.body
        || !queryParameters.clauses) {
        return res.status(400).send('Missing query parameters.');
    }
    var clauses;
    try {
        clauses = Array.isArray(queryParameters.clauses) ? queryParameters.clauses.map(function (clauseJSON) { return JSON.parse(clauseJSON); }) : [JSON.parse(queryParameters.clauses)];
        if (clauses.some(function (clause) { return !clause.title; })) {
            return res.status(400).send('Missing title in clauses.');
        }
    }
    catch (e) {
        return res.status(400).send('Invalid JSON in clauses.');
    }
    var authors;
    try {
        authors = Array.isArray(queryParameters.authors) ? queryParameters.authors.map(function (authorJSON) { return JSON.parse(authorJSON); }) : [JSON.parse(queryParameters.authors)];
        if (authors.some(function (author) { return !author.name; })) {
            return res.status(400).send('Missing name in authors.');
        }
    }
    catch (e) {
        return res.status(400).send('Invalid JSON in authors.');
    }
    // Generate file with query parameters
    var generatedTex = GENERATE_MOTION_TEX(__assign(__assign({}, queryParameters), { clauses: clauses, authors: authors }));
    var uniqueFileName = "".concat(Date.now(), "-").concat(uuid.v4());
    // Write file to disk
    fs.writeFileSync("uploads/".concat(uniqueFileName, ".tex"), generatedTex, function (err) {
        if (err) {
            return res.status(500).send('Failed to write file to disk.');
        }
    });
    // Compile file
    exec("latexmk -f uploads/".concat(uniqueFileName, ".tex || true"), function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            return res.status(500).send('Failed to compile file.');
        }
        console.log(stdout);
        console.log(stderr);
        // Move file to output folder
        exec('mv *.pdf output/ && mv *.log logs/', function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return res.status(500).send('Failed to move file.');
            }
            console.log(stdout);
            console.log(stderr);
            // Clean up
            exec('latexmk -c', function (err, stdout, stderr) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Failed to clean up.');
                }
                console.log(stdout);
                console.log(stderr);
                // Send file to client
                var filename = "".concat(uniqueFileName, ".pdf");
                var filePath = path.join(__dirname, 'output', filename);
                // show pdf in browser
                res.sendFile(filePath);
            });
        });
    });
});
app.get('/test', function (req, res) {
    var filename = "test.pdf";
    var filePath = path.join(__dirname, 'output', filename);
    // show pdf in browser
    res.sendFile(filePath);
});
// Set up a route to handle file downloads
app.get('/output/:filename', function (req, res) {
    var filename = req.params.filename;
    var filePath = path.join(__dirname, 'output', filename);
    res.download(filePath, function (err) {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(404).send('File not found.');
        }
    });
});
// Start the server
app.listen(port, function () {
    console.log("Server listening on port ".concat(port));
});
// Path: index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
var GENERATE_CLAUSES = function (clauses) { return clauses.map(function (clause) {
    return clause.description
        ? "  \\ATTDESC{".concat(clause.title, "}{").concat(clause.description, "}\n")
        : "  \\ATT{".concat(clause.title, "}\n");
})
    .join(''); };
var GENERATE_AUTHORS = function (authors, signMessage) { return authors.map(function (author, index) { return "  \\signature{".concat(index === 0 ? (signMessage !== null && signMessage !== void 0 ? signMessage : 'För D-sektionen, dag som ovan') : '', "}{").concat(author.name, "}{").concat(author.position ? "".concat(author.position) : '', "}\n"); }).join(''); };
var GENERATE_MOTION_TEX = function (parameters) { return "\n\\documentclass[nopdfbookmarks,a4paper, 11pt, twoside]{article}\n\n\\usepackage{dsekcommon}\n\\usepackage{dsekdokument}\n\\usepackage[T1]{fontenc}\n\\usepackage[swedish]{babel}\n\n\\newcommand{\\MOTE}{".concat(parameters.meeting, "} % Fyll i vilket m\u00F6te det g\u00E4ller\n\\newcommand{\\YEAR}{\\the\\year{}} % Fyll i \u00E5r\n\\newcommand{\\TITLE}{").concat(parameters.title, "} % Fyll i titel p\u00E5 motionen\n\\newcommand{\\PLACE}{Lund} % Fyll i plats d\u00E4r motionen skrevs, oftast bara \"Lund\"\n\\newcommand{\\TEXT}{").concat(parameters.body, "} % Fyll i motionens br\u00F6dtext\n\\newcommand{\\UNDER}{Undertecknad yrkar att m\u00F6tet m\u00E5 besluta}\n\\newcommand{\\ATT}[1]{\\item #1}\n\\newcommand{\\ATTDESC}[2]{\\item #1 \\begin{description} \\item #2 \\end{description}}\n\n\\setheader{Motion}{\\MOTE - \\YEAR}{\\PLACE, \\today}\n\\title{Motion: \\TITLE}\n\n\\begin{document}\n\\section*{Motion: \\TITLE}\n\n\n\\TEXT\n\n\\UNDER\n\n\n\\begin{attlista}\n\t").concat(GENERATE_CLAUSES(parameters.clauses), "\n\\end{attlista}\n\n").concat(GENERATE_AUTHORS(parameters.authors, parameters.signMessage), "\n\\end{document}\n"); };
