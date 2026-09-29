import { RowUiLoading } from './loading';
import { RowUiError } from './error';

export * from './loading';
export * from './error';

/** What draws a full-width row, and nothing that knows which row. */
export interface IRowUi {
    Loading: typeof RowUiLoading;
    Error: typeof RowUiError;
}

export const RowUi: IRowUi = {
    Loading: RowUiLoading,
    Error: RowUiError,
};
