/** Query parameters a url is built with. Anything unset is left out rather than sent empty. */
export interface IUrlParameters {
    [name: string]: string | number | boolean | undefined | null;
}

export interface IJsonRequest {
    signal?: AbortSignal;
    headers?: { [name: string]: string };
    /** Sent as a JSON body, which also makes the request a POST. Omit for a GET. */
    body?: unknown;
}

/** Builds a url, dropping the parameters that have no value. */
export const buildUrl = (base: string, parameters: IUrlParameters = {}): string => {
    const query = new URLSearchParams();
    Object.entries(parameters).forEach(([name, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        query.append(name, `${value}`);
    });
    const search = query.toString();
    return search ? `${base}?${search}` : base;
};

/**
 * Fetches JSON, turning a response the service rejected into an error rather than a parse failure.
 *
 * @throws When the request is aborted, the network fails, or the service answers outside 2xx.
 */
export const getJson = async <T>(url: string, request: IJsonRequest = {}): Promise<T> => {
    const response = await fetch(url, {
        method: request.body === undefined ? 'GET' : 'POST',
        signal: request.signal,
        headers: {
            Accept: 'application/json',
            ...(request.body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...request.headers
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body)
    });
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
    }
    return response.json() as Promise<T>;
};

/** Runs work one call at a time, no faster than the interval it was built with. */
export type IRequestQueue = <T>(run: () => Promise<T>) => Promise<T>;

/**
 * Builds a queue that serializes calls and keeps a minimum gap between them. Public geocoding services
 * publish a rate limit, and exceeding it gets an origin blocked rather than throttled - so the limit
 * belongs in the client.
 */
export const createRequestQueue = (minimumIntervalMs: number): IRequestQueue => {
    let tail: Promise<unknown> = Promise.resolve();
    let previousStart = 0;

    return <T>(run: () => Promise<T>): Promise<T> => {
        const result = tail.then(async () => {
            const wait = previousStart + minimumIntervalMs - Date.now();
            if (wait > 0) {
                await new Promise((resolve) => setTimeout(resolve, wait));
            }
            previousStart = Date.now();
            return run();
        });
        //the queue must keep going after a rejection, so what it chains on never carries one
        tail = result.catch(() => undefined);
        return result;
    };
};

export interface IResultCache<T> {
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): void;
    readonly size: number;
}

/** Builds a bounded cache that discards whatever was used longest ago. */
export const createResultCache = <T>(maxEntries = 200): IResultCache<T> => {
    //a Map iterates in insertion order, so re-inserting on read is what makes eviction least-recently-used
    const entries = new Map<string, T>();

    return {
        get: (key) => {
            if (!entries.has(key)) {
                return undefined;
            }
            const value = entries.get(key) as T;
            entries.delete(key);
            entries.set(key, value);
            return value;
        },
        set: (key, value) => {
            entries.delete(key);
            entries.set(key, value);
            while (entries.size > maxEntries) {
                entries.delete(entries.keys().next().value as string);
            }
        },
        delete: (key) => {
            entries.delete(key);
        },
        get size() {
            return entries.size;
        }
    };
};
