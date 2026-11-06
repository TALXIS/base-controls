import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { DatasetControlUi, IDatasetControlUiQuickFindComponents } from "../../ui";
import { useDataProviderEvents } from "@data";
import { useProvideDatasetControlPart } from "../root";
import { QUICK_FIND_LABELS } from "./labels";
import { DatasetControlQuickFind, IDatasetControlQuickFindEvents } from "../../runtime/parts/quick-find/DatasetControlQuickFind";

/** Props for `DatasetControl.QuickFind`. */
export interface IQuickFindProps {
    /** Replacements for the quick find's slots. */
    components?: Partial<IDatasetControlUiQuickFindComponents>;
}

/** Searches the provider for what the user types. */
export const QuickFind = (props: IQuickFindProps) => {
    const provider = useDataProviderEvents(['onLoading']);
    const quickFind = useProvideDatasetControlPart('quickFind', () => new DatasetControlQuickFind({ provider }));
    const labels = useLabels(QUICK_FIND_LABELS);
    const { rerender } = useRerender();

    useEventEmitter<IDatasetControlQuickFindEvents>(quickFind.events, 'onQueryChanged', rerender);

    return <DatasetControlUi.QuickFind
        value={quickFind.getQuery()}
        placeholder={labels.get('quickFind.searchPlaceholder', { collection: provider.getMetadata()?.DisplayCollectionName ?? labels.get('quickFind.defaultCollectionName') })}
        columns={quickFind.getColumns()}
        isLikeQuery={quickFind.isLikeQuery()}
        disabled={provider.isLoading()}
        labels={{
            leadingWildcardWarning: labels.get('quickFind.leadingWildcardWarning'),
            columnsHintStart: labels.get('quickFind.columnsHintStart'),
            columnsHintOperator: labels.get('quickFind.columnsHintOperator'),
            columnsHintEnd: labels.get('quickFind.columnsHintEnd'),
        }}
        onChange={value => quickFind.setQuery(value)}
        onSearch={() => quickFind.search()}
        onClear={() => quickFind.clear()}
        components={props.components} />;
};
