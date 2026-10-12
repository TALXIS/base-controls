import { useMemo } from "react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { LocalizationService, useDataProvider } from "@utils";
import { DatasetControlUi, IEmptyRecordsUiComponents } from "../../ui";
import { EMPTY_RECORDS_LABELS, IEmptyRecordsLabels } from "./labels";

export interface IEmptyRecordsProps {
    children?: React.ReactNode;
    labels?: Partial<IEmptyRecordsLabels>;
    components?: Partial<IEmptyRecordsUiComponents>;
}

/** The empty state in place of its children while the provider has no records. */
export const EmptyRecords = (props: IEmptyRecordsProps) => {
    const provider = useDataProvider();
    const labels = useMemo(() => new LocalizationService<IEmptyRecordsLabels>({ ...EMPTY_RECORDS_LABELS, ...props.labels }), [props.labels]);
    const { rerender } = useRerender();

    useEventEmitter<IDataProviderEventListeners>(provider, ['onNewDataLoaded', 'onLoading'], rerender);

    if (provider.isLoading() || provider.getRecords().length > 0) {
        return <>{props.children}</>;
    }
    return <DatasetControlUi.EmptyRecords message={labels.getLocalizedString('noRecordsFound')} components={props.components} />;
};
