import { describe, expect, it, vi } from 'vitest';
import { IMapGeocoder, IMapPlace } from '../core/geocoding';
import { withGeocodingCache } from './geocodingCache';

const place = (label: string): IMapPlace => ({
    coordinates: { latitude: 50, longitude: 14 },
    address: { text: label },
    label
});

describe('withGeocodingCache', () => {
    const createGeocoder = (): IMapGeocoder => ({
        geocode: vi.fn(async (query: string) => [place(query)]),
        reverseGeocode: vi.fn(async () => place('reversed'))
    });

    it('asks the service once per address', async () => {
        const inner = createGeocoder();
        const cached = withGeocodingCache(inner);

        await cached.geocode('Praha');
        await cached.geocode('Praha');

        expect(inner.geocode).toHaveBeenCalledOnce();
    });

    it('keeps lookups in different languages apart', async () => {
        const inner = createGeocoder();
        const cached = withGeocodingCache(inner);

        await cached.geocode('Praha', { language: 'cs' });
        await cached.geocode('Praha', { language: 'en' });

        expect(inner.geocode).toHaveBeenCalledTimes(2);
    });

    it('shares an in flight call rather than duplicating it', async () => {
        const inner = createGeocoder();
        const cached = withGeocodingCache(inner);

        const [first, second] = await Promise.all([cached.geocode('Brno'), cached.geocode('Brno')]);

        expect(inner.geocode).toHaveBeenCalledOnce();
        expect(first).toEqual(second);
    });

    it('asks the service once per point, to a tenth of a metre', async () => {
        const inner = createGeocoder();
        const cached = withGeocodingCache(inner);

        await cached.reverseGeocode({ latitude: 50.0755001, longitude: 14.4378001 });
        await cached.reverseGeocode({ latitude: 50.0755002, longitude: 14.4378002 });

        expect(inner.reverseGeocode).toHaveBeenCalledOnce();
    });

    it('forgets a failed lookup instead of caching the failure', async () => {
        const inner: IMapGeocoder = {
            geocode: vi.fn()
                .mockRejectedValueOnce(new Error('offline'))
                .mockResolvedValueOnce([place('Praha')]),
            reverseGeocode: vi.fn(async () => null)
        };
        const cached = withGeocodingCache(inner);

        await expect(cached.geocode('Praha')).rejects.toThrow('offline');
        await expect(cached.geocode('Praha')).resolves.toEqual([place('Praha')]);
        expect(inner.geocode).toHaveBeenCalledTimes(2);
    });

    it('keeps a service that refuses type-ahead refusing it through the cache', () => {
        expect(withGeocodingCache({ ...createGeocoder(), allowsTypeAhead: false }).allowsTypeAhead).toBe(false);
        expect(withGeocodingCache(createGeocoder()).allowsTypeAhead).toBeUndefined();
    });

    it('carries the bulk limit a service publishes through the cache', () => {
        expect(withGeocodingCache({ ...createGeocoder(), maxBulkRequests: 25 }).maxBulkRequests).toBe(25);
        expect(withGeocodingCache(createGeocoder()).maxBulkRequests).toBeUndefined();
    });
});
