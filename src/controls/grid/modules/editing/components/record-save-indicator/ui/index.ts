import { ICellUiContainerComponents } from '../../../../../components/cells/ui';
import { IRecordSaveUiIndicatorComponents, RecordSaveUiIndicator } from './indicator';
import { IRecordSaveUiErrorCalloutComponents, RecordSaveUiErrorCallout } from './error-callout';

export * from './indicator';
export * from './error-callout';

/** What draws a record's save status, and nothing that knows which record. */
export interface IRecordSaveUi {
    Indicator: typeof RecordSaveUiIndicator;
    ErrorCallout: typeof RecordSaveUiErrorCallout;
}

export const RecordSaveUi: IRecordSaveUi = {
    Indicator: RecordSaveUiIndicator,
    ErrorCallout: RecordSaveUiErrorCallout,
};

/** The replaceable pieces a record's save status is drawn with, by the part they belong to. */
export interface IRecordSaveUiComponents {
    /** The element the indicator is drawn in, where it is drawn in a cell of its own. */
    container?: Partial<ICellUiContainerComponents>;
    indicator?: Partial<IRecordSaveUiIndicatorComponents>;
    errorCallout?: Partial<IRecordSaveUiErrorCalloutComponents>;
}
