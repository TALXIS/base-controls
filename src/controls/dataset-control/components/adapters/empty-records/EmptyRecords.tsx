import { useMemo } from "react";
import { LocalizationService, useDataProviderEvents } from "@utils";
import { DatasetControlUi, IEmptyRecordsUiComponents } from "../../ui";
import { EMPTY_RECORDS_LABELS, IEmptyRecordsLabels } from "./labels";

/** Props for `DatasetControl.EmptyRecords`. */
export interface IEmptyRecordsProps {
    /** What shows the records while there are some. */
    children?: React.ReactNode;
    /** Overrides for the empty state's strings. */
    labels?: Partial<IEmptyRecordsLabels>;
    /** Replacements for the empty state's slots. */
    components?: Partial<IEmptyRecordsUiComponents>;
}

/** The empty state in place of its children while the provider has no records. */
export const EmptyRecords = (props: IEmptyRecordsProps) => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onLoading']);
    const labels = useMemo(() => new LocalizationService<IEmptyRecordsLabels>({ ...EMPTY_RECORDS_LABELS, ...props.labels }), [props.labels]);
    if (provider.isLoading() || provider.getRecords().length > 0) {
        return <>{props.children}</>;
    }
    return <DatasetControlUi.EmptyRecords message={labels.getLocalizedString('noRecordsFound')} components={props.components} />;
};
