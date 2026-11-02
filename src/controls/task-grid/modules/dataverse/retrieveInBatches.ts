//keeps a Web API request's URL under its length limit
const MAX_IDS_PER_REQUEST = 800;

/** Runs `retrieve` once per batch of ids, quoted and comma separated for an `In` filter. */
export const retrieveInBatches = async <T,>(ids: string[], retrieve: (quotedIds: string) => Promise<T[]>): Promise<T[]> => {
    const batches: string[][] = [];
    for (let index = 0; index < ids.length; index += MAX_IDS_PER_REQUEST) {
        batches.push(ids.slice(index, index + MAX_IDS_PER_REQUEST));
    }
    const results = await Promise.all(batches.map(batch => retrieve(batch.map(id => `'${id}'`).join(','))));
    return results.flat();
};
