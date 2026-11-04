import { useLabels } from "@labels";
import { useDataProviderEvents } from "@data";
import { DatasetControlUi } from "../../ui";
import { IEmptyStateUiComponents } from "../../ui/empty-state";
import { EMPTY_STATE_LABELS } from "./labels";

/** Props for `DatasetControl.EmptyState`. */
export interface IEmptyStateProps {
    /** What shows the records while there are some. */
    children?: React.ReactNode;
    /** Replacements for the empty state's slots. */
    components?: Partial<IEmptyStateUiComponents>;
}

/** The empty state in place of its children while the provider has no records. */
export const EmptyState = (props: IEmptyStateProps) => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onLoading']);
    const labels = useLabels(EMPTY_STATE_LABELS);
    if (provider.isLoading() || provider.getRecords().length > 0) {
        return <>{props.children}</>;
    }
    return <DatasetControlUi.EmptyState message={labels.get('emptyState.noRecordsFound')} components={props.components} />;
};
