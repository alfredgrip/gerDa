console.log("hej från +page.server.ts")
import compileMotion from './compileMotion'
import type { PageServerLoad } from './$types';
// get port

type Clause = {
    clause: string;
    description?: string;
}
type Author = {
    name: string;
    position?: string;
}
type DocumentType = 'motion' | 'proposition' | 'handling'
type MotionParams = {
    title: string;
    authors: Author[];
    meeting: string;
    body: string;
    clauses: Clause[];
    signMessage: string;
}

export const load = (async ({url}) => {
    //console.log("hej från load")
    const params = url.searchParams
    console.log(params)
    const title: string = params.get("title") ?? "no title"
    const authors: string = params.get("authors") ?? "no authors"
    const meeting: string = params.get("meeting") ?? "no meeting"
    const body: string = params.get("body") ?? "no body"
    const clauses: string  = params.get("clauses") ?? "no clauses"
    const type: string = params.get("type") ?? "no type"
    const signMessage: string = params.get("signMessage") ?? "no signMessage"

    checkValid(title, authors, meeting, body, clauses, type, signMessage)
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
        const filePath: string = compileMotion(motionParams)
        console.log(filePath)
        const response = {
            status: 200,
            location: filePath
        }
        console.log(response)
        return response
        // redirect to the filepath, how to do this?

    }
}) satisfies PageServerLoad;

function checkValid(title: string | null, authors : string | null, meeting: string | null, body: string | null, clauses: string | null, type: string | null, signMessage: string | null): boolean {
    if (!title) {
        console.log("no title")
        return false
    }
    if (!authors) {
        console.log("no authors")
        return false
    }
    if (!meeting) {
        console.log("no meeting")
        return false
    }
    if (!body) {
        console.log("no body")
        return false
    }
    if (!clauses) {
        console.log("no clauses")
        return false
    }
    if (!type) {
        console.log("no type")
        return false
    }
    if (!signMessage) {
        console.log("no signMessage")
        return false
    }
    return true
}