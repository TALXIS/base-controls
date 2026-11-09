import { describe, expect, it } from 'vitest';
import { IMapFallbackLocationState, shouldResolveFallbackLocation } from './fallbackLocation';

const settled: IMapFallbackLocationState = {
    hasLocations: false,
    isDatasetLoading: false,
    isLoadingAllRecords: false,
    isResolving: false
};

describe('shouldResolveFallbackLocation', () => {
    it('resolves once the dataset has answered with nothing to fit', () => {
        expect(shouldResolveFallbackLocation(settled)).toBe(true);
    });

    it('never resolves while the map already has pins', () => {
        expect(shouldResolveFallbackLocation({ ...settled, hasLocations: true })).toBe(false);
    });

    it('waits for a dataset that is still fetching, rather than reading empty as final', () => {
        expect(shouldResolveFallbackLocation({ ...settled, isDatasetLoading: true })).toBe(false);
    });

    it('waits while the remaining pages of the view are still being drained', () => {
        expect(shouldResolveFallbackLocation({ ...settled, isLoadingAllRecords: true })).toBe(false);
    });

    it('waits while a module is still placing records, such as by geo-coding an address', () => {
        expect(shouldResolveFallbackLocation({ ...settled, isResolving: true })).toBe(false);
    });

    it('stays false while anything at all is still working', () => {
        expect(shouldResolveFallbackLocation({
            hasLocations: true,
            isDatasetLoading: true,
            isLoadingAllRecords: true,
            isResolving: true
        })).toBe(false);
    });
});
