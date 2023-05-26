const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'output.tex');
  }
});

const upload = multer({ storage: storage });

// Set up a route to handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  //res.send('File uploaded successfully!');

  await compileFunction(req.file.path)
  res.redirect('/output/output.pdf');
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

// Serve static files
app.use(express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Path: index.html

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    }
);




async function compileFunction(pathToUploadedFile) {

    const outputDir = 'output/'
    const logsDir = 'logs/'

    const compileCommand = `latexmk -f ${pathToUploadedFile}`
    const moveCommand = 'mv *.pdf output/ && mv *.log logs/'
    const cleanUpCommand = 'rm -f *.aux *.fdb_latexmk *.fls *.out *.synctex.gz'

    return new Promise((resolve, reject) => {
        exec(compileCommand, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            console.log(stdout)
            console.log(stderr)
            exec(moveCommand, (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                console.log(stdout)
                console.log(stderr)
                exec(cleanUpCommand, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    console.log(stdout)
                    console.log(stderr)
                    resolve()
                })
            })
        }
        )
        console.log('done')
    })
}


