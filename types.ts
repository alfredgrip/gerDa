export type DocumentType = 'Motion' | 'Proposition'

export type Clause = {
  clause: string
  description?: string
}

export type Author = {
  name: string
  position?: string
}

export type QueryParameters = {
  title: string
  authors: Author[]
  meeting: string
  body: string
  clauses: Clause[]
  signMessage?: string
  type?: DocumentType
}

export type QueryParametersInput = Omit<QueryParameters, 'clauses' | 'authors'> & {
  clauses: string[] | string
  authors: string[] | string
}
