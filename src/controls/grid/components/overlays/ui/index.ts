import { OverlayUiLoading } from './loading';
import { OverlayUiEmptyRecords } from './empty-records';

export * from './loading';
export * from './empty-records';

/** What draws an overlay, and nothing that knows why it is shown. */
export interface IOverlayUi {
    Loading: typeof OverlayUiLoading;
    EmptyRecords: typeof OverlayUiEmptyRecords;
}

export const OverlayUi: IOverlayUi = {
    Loading: OverlayUiLoading,
    EmptyRecords: OverlayUiEmptyRecords,
};
