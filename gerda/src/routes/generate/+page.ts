
export const load = ({fetch, url}) => {
    const params = url.searchParams
    const fetchdata = async () => {
        const res = await fetch(`/api/compile-motion?${params.toString()}`)
        const data = await res.json()
        return data.filePath
    }
    return {
        filePath: fetchdata()
    }
}