import { useEffect, useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { DatasetControlUi, IQuickFindUiComponents } from "../../ui";
import { LocalizationService, useDataProviderEvents } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { IQuickFindLabels, QUICK_FIND_LABELS } from "./labels";
import { DatasetControlQuickFind, IDatasetControlQuickFindEvents } from "./DatasetControlQuickFind";

/** Props for `DatasetControl.QuickFind`. */
export interface IQuickFindProps {
    /** Overrides for the quick find's strings. */
    labels?: Partial<IQuickFindLabels>;
    /** Replacements for the quick find's slots. */
    components?: Partial<IQuickFindUiComponents>;
}

/** Searches the provider for what the user types. */
export const QuickFind = (props: IQuickFindProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const quickFind = useMemo(() => new DatasetControlQuickFind({ services: runtime.services, provider }), []);
    const labels = useMemo(() => new LocalizationService<IQuickFindLabels>({ ...QUICK_FIND_LABELS, ...props.labels }), [props.labels]);
    const { rerender } = useRerender();

    useEventEmitter<IDatasetControlQuickFindEvents>(quickFind.events, 'onQueryChanged', rerender);
    useEffect(() => () => quickFind.destroy(), []);

    return <DatasetControlUi.QuickFind
        value={quickFind.getQuery()}
        placeholder={labels.getLocalizedString('searchPlaceholder', { collection: provider.getMetadata()?.DisplayCollectionName ?? labels.getLocalizedString('defaultCollectionName') })}
        columns={quickFind.getColumns()}
        isLikeQuery={quickFind.isLikeQuery()}
        disabled={provider.isLoading()}
        labels={{
            leadingWildcardWarning: labels.getLocalizedString('leadingWildcardWarning'),
            columnsHintStart: labels.getLocalizedString('columnsHintStart'),
            columnsHintOperator: labels.getLocalizedString('columnsHintOperator'),
            columnsHintEnd: labels.getLocalizedString('columnsHintEnd'),
        }}
        onChange={value => quickFind.setQuery(value)}
        onSearch={() => quickFind.search()}
        onClear={() => quickFind.clear()}
        components={props.components} />;
};
