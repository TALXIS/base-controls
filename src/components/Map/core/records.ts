import { IDataProvider, IDataset, IRecord } from '@talxis/client-libraries';

/** Which records the map draws: the page the host loaded, or every page of the view. */
export type IMapPinLoading = 'page' | 'all';

/** Records fetched per request while draining, matching what the export path already uses. */
export const ALL_RECORDS_PAGE_SIZE = 5000;

/** Records loaded before the control gives up, so a view nobody scoped cannot hang the browser. */
export const DEFAULT_MAX_RECORDS = 50000;

export interface ILoadAllRecordsOptions {
    /** Records to load before stopping. Defaults to `DEFAULT_MAX_RECORDS`. */
    maxRecords?: number;
    /**
     * Records to fetch per request. Defaults to `ALL_RECORDS_PAGE_SIZE`; a smaller value trades requests for
     * more frequent progress and a faster response to cancellation.
     */
    pageSize?: number;
    /** Called after every page, so a caller can show progress on a long load. */
    onProgress?: (loadedCount: number) => void;
    /** Checked between pages; a cancelled load returns what it had rather than throwing. */
    isCancelled?: () => boolean;
}

export interface IMapRecordsResult {
    records: IRecord[];
    /** `true` when the load stopped at the cap or was cancelled, rather than at the end of the data. */
    isTruncated: boolean;
    /**
     * Releases the provider the records came from. The records stop working once it is called - they read
     * their columns and formatted values back through it - so call it only when they are finished with,
     * which is when a later load has replaced them.
     */
    dispose: () => void;
}

/**
 * Loads every page of a dataset, not just the one the host is showing. Runs on a clone of the data
 * provider, so the paging state of the dataset the rest of the app is bound to is left untouched - the
 * same approach the export path takes. The clone has to outlive the call, so releasing it via `dispose` is
 * the caller's job.
 */
export const loadAllDatasetRecords = async (
    dataset: IDataset,
    options: ILoadAllRecordsOptions = {}
): Promise<IMapRecordsResult> => {
    const maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
    const provider: IDataProvider = dataset.getDataProvider().createNewDataProvider();
    const dispose = () => provider.destroy();

    try {
        provider.getPaging().setPageSize(Math.min(options.pageSize ?? ALL_RECORDS_PAGE_SIZE, maxRecords));
        const records = [...await provider.refresh()];
        options.onProgress?.(records.length);

        while (provider.getPaging().hasNextPage && records.length < maxRecords) {
            if (options.isCancelled?.()) {
                return { records: records.slice(0, maxRecords), isTruncated: true, dispose };
            }
            records.push(...await provider.getPaging().loadNextPage());
            options.onProgress?.(records.length);
        }

        const isTruncated = records.length > maxRecords || provider.getPaging().hasNextPage;
        return { records: records.slice(0, maxRecords), isTruncated, dispose };
    } catch (error) {
        dispose();
        throw error;
    }
};
