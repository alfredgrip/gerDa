import express, { Request, Response } from 'express'
import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'

const app = express()
const port = 3000

import { GENERATE_MOTION, GENERATE_PROPOSITION } from './templates'
import { QueryParametersInput, Clause, Author } from './types'

// Takes in query parameters
app.get('/generate', (req: Request, res: Response) => {
  // get query parameters
  const queryParameters: QueryParametersInput =
    req.query as QueryParametersInput

  let validationResponse: { clauses: Clause[]; authors: Author[] } | undefined =
    undefined

  switch (queryParameters.type?.toLowerCase()) {
    case 'motion': // same parameters as proposition
    case 'proposition':
      validationResponse = validateMotionParams(queryParameters, res)
      if (validationResponse === undefined) {
        return
      } else {
        const { clauses, authors } = validationResponse
        let generatedTex = ''
        if (queryParameters.type?.toLowerCase() === 'motion') {
          generatedTex = GENERATE_MOTION({
            ...queryParameters,
            clauses,
            authors
          })
        } else {
          generatedTex = GENERATE_PROPOSITION({
            ...queryParameters,
            clauses,
            authors
          })
        }
        const uniqueFileName = `${queryParameters.title}-${Date.now()}.tex`
        if (!writeTexFile(generatedTex, uniqueFileName, res)) {
          return res.status(500).send('Failed to write file to disk.')
        }
      }
      break
    default:
      return res
        .status(400)
        .send(
          `Invalid or missing type. Must be either 'Motion' or 'Proposition'.`
        )
  }
})

// Set up a route to handle file downloads
app.get('/output/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'output', filename)
  res.download(filePath, err => {
    if (err) {
      console.error('Error downloading file:', err)
      res.status(404).send('File not found.')
    }
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

// Path: index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

function validateMotionParams (
  params: QueryParametersInput,
  res: Response
): { clauses: Clause[]; authors: Author[] } | undefined {
  let clauses: Clause[]
  let authors: Author[]
  if (!params.title) {
    res.status(400).send('Missing title.')
    return undefined
  }
  if (!params.authors) {
    res.status(400).send('Missing authors.')
    return undefined
  }
  if (!params.meeting) {
    res.status(400).send('Missing meeting.')
    return undefined
  }
  if (!params.body) {
    res.status(400).send('Missing body.')
    return undefined
  }
  if (!params.clauses) {
    res.status(400).send('Missing clauses.')
    return undefined
  }
  if (!params.type) {
    res.status(400).send('Missing type.')
    return undefined
  }

  try {
    clauses = Array.isArray(params.clauses)
      ? params.clauses.map(clauseJSON => JSON.parse(clauseJSON))
      : [JSON.parse(params.clauses)]
    if (clauses.some(clause => !clause.clause)) {
      res.status(400).send('Missing title in clauses.')
      return undefined
    }
  } catch (e) {
    res.status(400).send('Invalid JSON in clauses.')
    return undefined
  }
  try {
    authors = Array.isArray(params.authors)
      ? params.authors.map(authorJSON => JSON.parse(authorJSON))
      : [JSON.parse(params.authors)]
    if (authors.some(author => !author.name)) {
      res.status(400).send('Missing name in authors.')
      return undefined
    }
  } catch (e) {
    res.status(400).send('Invalid JSON in authors.')
    return undefined
  }
  return { clauses, authors }
}

// function validatePropositionParams (
//   params: QueryParametersInput,
//   res: Response
// ): { clauses: Clause[]; authors: Author[] } | undefined {
//   return validateMotionParams(params, res)
// }

function writeTexFile (
  tex: string,
  uniqueFileName: string,
  res: Response
): boolean {
  try {
    fs.mkdirSync('uploads', { recursive: true })
    fs.writeFileSync(`uploads/${uniqueFileName}.tex`, tex)
    compileCleanAndMove(uniqueFileName, res)
    return true
  } catch (e) {
    return false
  }
}

function compileCleanAndMove (uniqueFileName: string, res: Response) {
  exec(
    `latexmk -f uploads/${uniqueFileName}.tex || true`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err)
        return res.status(500).send('Failed to compile file.')
      }
      // Move file to output folder
      fs.mkdirSync('output', { recursive: true })
      fs.mkdirSync('logs', { recursive: true })
      exec('mv *.pdf output/ && mv *.log logs/', err => {
        if (err) {
          console.log(err)
          return res.status(500).send('Failed to move file.')
        }
        // Clean up
        exec(
          `rm -f *.aux *.fdb_latexmk *.fls *.out *.synctex.gz uploads/${uniqueFileName}.tex`,
          err => {
            if (err) {
              console.log(err)
              return res.status(500).send('Failed to clean up.')
            }

            const filename = `${uniqueFileName}.pdf`
            const filePath = path.join(__dirname, 'output', filename)
            // show pdf in browser
            res.sendFile(filePath)
          }
        )
      })
    }
  )
}
