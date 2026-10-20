import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildUrl, createRequestQueue, createResultCache, getJson } from './http';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('buildUrl', () => {
    it('appends the parameters that have a value', () => {
        expect(buildUrl('https://example.com/v1', { q: 'Praha 1', limit: 5, retina: true }))
            .toBe('https://example.com/v1?q=Praha+1&limit=5&retina=true');
    });

    it('leaves out unset and empty parameters', () => {
        expect(buildUrl('https://example.com/v1', { a: '1', b: undefined, c: null, d: '' }))
            .toBe('https://example.com/v1?a=1');
    });

    it('returns the base alone when nothing has a value', () => {
        expect(buildUrl('https://example.com/v1', { a: undefined })).toBe('https://example.com/v1');
        expect(buildUrl('https://example.com/v1')).toBe('https://example.com/v1');
    });

    it('keeps zero and false, which are values', () => {
        expect(buildUrl('https://example.com', { lat: 0, poi: false })).toBe('https://example.com?lat=0&poi=false');
    });
});

describe('getJson', () => {
    it('gets and parses a response', async () => {
        const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response('{"items":[1]}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(getJson<{ items: number[] }>('https://example.com')).resolves.toEqual({ items: [1] });
        expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET', body: undefined });
    });

    it('posts when it is given a body', async () => {
        const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response('{}', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        await getJson('https://example.com', { body: { origin: 'a' }, headers: { 'X-Key': 'k' } });

        const init = fetchMock.mock.calls[0][1] as RequestInit;
        expect(init.method).toBe('POST');
        expect(init.body).toBe('{"origin":"a"}');
        expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-Key': 'k' });
    });

    it('turns a rejected response into an error carrying the status and the detail', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('quota exceeded', { status: 429, statusText: 'Too Many Requests' })));

        await expect(getJson('https://example.com')).rejects.toThrow(/429 Too Many Requests: quota exceeded/);
    });
});

describe('createRequestQueue', () => {
    it('keeps the configured gap between calls', async () => {
        vi.useFakeTimers();
        const queue = createRequestQueue(1000);
        const starts: number[] = [];
        const run = () => {
            starts.push(Date.now());
            return Promise.resolve('done');
        };

        const all = Promise.all([queue(run), queue(run), queue(run)]);
        await vi.advanceTimersByTimeAsync(5000);

        expect(await all).toEqual(['done', 'done', 'done']);
        expect(starts[1] - starts[0]).toBeGreaterThanOrEqual(1000);
        expect(starts[2] - starts[1]).toBeGreaterThanOrEqual(1000);
    });

    it('keeps running after a call rejects', async () => {
        const queue = createRequestQueue(0);
        const failed = queue(() => Promise.reject(new Error('nope')));

        await expect(failed).rejects.toThrow('nope');
        await expect(queue(() => Promise.resolve('still here'))).resolves.toBe('still here');
    });
});

describe('createResultCache', () => {
    it('returns what was put in', () => {
        const cache = createResultCache<number>();
        cache.set('a', 1);
        expect(cache.get('a')).toBe(1);
        expect(cache.get('b')).toBeUndefined();
    });

    it('evicts the entry used longest ago once it is full', () => {
        const cache = createResultCache<number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.get('a');
        cache.set('c', 3);

        expect(cache.size).toBe(2);
        expect(cache.get('a')).toBe(1);
        expect(cache.get('b')).toBeUndefined();
        expect(cache.get('c')).toBe(3);
    });

    it('forgets a deleted entry', () => {
        const cache = createResultCache<number>();
        cache.set('a', 1);
        cache.delete('a');
        expect(cache.get('a')).toBeUndefined();
        expect(cache.size).toBe(0);
    });

    it('does not grow when the same key is written twice', () => {
        const cache = createResultCache<number>(2);
        cache.set('a', 1);
        cache.set('a', 2);
        expect(cache.size).toBe(1);
        expect(cache.get('a')).toBe(2);
    });
});
