import type { IRecord } from "@talxis/client-libraries";
import type { IDatasetControl } from "../../../runtime/interfaces";
import type { IUserQueriesLabels } from "../labels";
import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import { ITalxisUserQueriesProviderParameters, TalxisUserQueriesProvider } from "./TalxisUserQueriesProvider";

const LAYOUT_COLUMN = 'talxis_layoutjson';

export interface ITalxisUserQueriesModuleParameters<TData> extends ITalxisUserQueriesProviderParameters {
    /** What the control shows right now, saved as the view's layout. */
    onCaptureViewData: (datasetControl: IDatasetControl<TData>) => TData | Promise<TData>;
    /** Reads a view's data from its record; parses `talxis_layoutjson` when left out. */
    onReadViewData?: (record: IRecord) => TData;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

/** The user's views as `talxis_userquery` records, with the layout kept as JSON in `talxis_layoutjson`. */
export const createTalxisUserQueriesModule = <TData,>(parameters: ITalxisUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    provider: new TalxisUserQueriesProvider(parameters),
    onReadViewData: parameters.onReadViewData ?? (record => JSON.parse(record.getValue(LAYOUT_COLUMN))),
    onWriteViewData: async ({ record, datasetControl }) => record.setValue(LAYOUT_COLUMN, JSON.stringify(await parameters.onCaptureViewData(datasetControl))),
    labels: parameters.labels,
});
