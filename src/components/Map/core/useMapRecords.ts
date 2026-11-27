import { useCallback, useEffect, useRef, useState } from 'react';
import { IDataProviderEventListeners, IDataset, IRecord } from '@talxis/client-libraries';
import { useEventEmitter } from '@hooks/useEventEmitter';
import { IMapPinLoading, loadAllDatasetRecords } from './records';

export interface IUseMapRecords {
    dataset?: IDataset;
    /** `page` draws what the host loaded, `all` drains every page of the view first. */
    loading: IMapPinLoading;
    /** Records to load before stopping, in `all` mode. */
    maxRecords?: number;
}

export interface IMapRecordsState {
    /** Records to draw as pins. */
    records: IRecord[];
    /** Whether every page is still being loaded. */
    isLoading: boolean;
    /** Records loaded so far, for a progress readout on a long load. */
    loadedCount: number;
    /** Whether the load stopped at the cap rather than at the end of the view. */
    isTruncated: boolean;
}

const EMPTY_RECORDS: IRecord[] = [];

/**
 * Resolves the records the map draws.
 *
 * In `page` mode the control reads what the host already loaded. In `all` mode it drains every page of the
 * view on a clone of the provider, leaving the bound dataset untouched. Either way a refresh starts it over.
 */
export const useMapRecords = (options: IUseMapRecords): IMapRecordsState => {
    const { dataset, loading, maxRecords } = options;
    const [state, setState] = useState<IMapRecordsState>({
        records: EMPTY_RECORDS,
        isLoading: false,
        loadedCount: 0,
        isTruncated: false
    });
    //bumped on every load so an earlier one that is still running knows to stop and to drop its result
    const loadIdRef = useRef(0);
    //the drained records read their columns back through the provider they came from, so it is released
    //only once a later load has replaced them
    const disposeRef = useRef<() => void>();

    const releasePrevious = useCallback((dispose?: () => void) => {
        disposeRef.current?.();
        disposeRef.current = dispose;
    }, []);

    const load = useCallback(() => {
        const loadId = ++loadIdRef.current;
        if (!dataset) {
            releasePrevious(undefined);
            setState({ records: EMPTY_RECORDS, isLoading: false, loadedCount: 0, isTruncated: false });
            return;
        }
        if (loading !== 'all') {
            releasePrevious(undefined);
            //a fresh array, so a save that changed a value in place still reaches the pins
            const records = [...dataset.getRecords()];
            setState({ records, isLoading: false, loadedCount: records.length, isTruncated: false });
            return;
        }
        setState((current) => ({ ...current, isLoading: true }));
        loadAllDatasetRecords(dataset, {
            maxRecords,
            isCancelled: () => loadIdRef.current !== loadId,
            onProgress: (loadedCount) => setState((current) =>
                loadIdRef.current === loadId ? { ...current, loadedCount } : current)
        })
            .then(({ records, isTruncated, dispose }) => {
                if (loadIdRef.current !== loadId) {
                    dispose();
                    return;
                }
                releasePrevious(dispose);
                setState({ records, isLoading: false, loadedCount: records.length, isTruncated });
            })
            .catch((error) => {
                console.warn('Map: failed to load every page of the dataset, drawing the loaded page instead:', error);
                if (loadIdRef.current === loadId) {
                    const records = dataset.getRecords();
                    setState({ records, isLoading: false, loadedCount: records.length, isTruncated: true });
                }
            });
    }, [dataset, loading, maxRecords, releasePrevious]);

    useEffect(() => {
        load();
    }, [load]);

    //the last clone outlives the last render, so it is released when the control goes away
    useEffect(() => () => {
        disposeRef.current?.();
        disposeRef.current = undefined;
    }, []);

    //a create or an edit reports itself as a saved record rather than as newly loaded data, and the map has
    //to redraw for both
    useEventEmitter<IDataProviderEventListeners>(dataset, ['onNewDataLoaded', 'onAfterRecordSaved', 'onAfterSaved'], load);

    return state;
};
