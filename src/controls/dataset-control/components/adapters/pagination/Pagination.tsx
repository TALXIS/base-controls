import { useEffect } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { DatasetControlUi, IPaginationUiComponents } from "../../ui";
import { useLabels, useDataProvider } from "@utils";
import { useDatasetControlPart } from "../root";
import { useDatasetControlRegion } from "../region";
import { PAGINATION_LABELS } from "./labels";
import { DatasetControlPagination, IDatasetControlPaginationEvents } from "./DatasetControlPagination";

/** Props for `DatasetControl.Pagination`. */
export interface IPaginationProps {
    /** Replacements for the pagination's slots. */
    components?: Partial<IPaginationUiComponents>;
}

/** Moves between the provider's pages. */
export const Pagination = (props: IPaginationProps) => {
    const provider = useDataProvider();
    const pagination = useDatasetControlPart('pagination', () => new DatasetControlPagination({ provider }));
    const labels = useLabels(PAGINATION_LABELS);
    const { rerender } = useRerender();
    const region = useDatasetControlRegion();

    useEventEmitter<IDatasetControlPaginationEvents>(pagination.events, 'onPagingChanged', rerender);
    useEffect(() => () => pagination.destroy(), []);

    return <DatasetControlUi.Pagination
        align={region === 'start' ? 'start' : 'end'}
        canMovePrevious={pagination.canMovePrevious()}
        canMoveNext={pagination.canMoveNext()}
        labels={{
            firstPageTooltip: labels.get('pagination.firstPageTooltip'),
            previousPageTooltip: labels.get('pagination.previousPageTooltip'),
            nextPageTooltip: labels.get('pagination.nextPageTooltip'),
            currentPage: labels.get('pagination.currentPage', { number: pagination.getPageNumber() }),
        }}
        onMoveFirst={() => pagination.moveFirst()}
        onMovePrevious={() => pagination.movePrevious()}
        onMoveNext={() => pagination.moveNext()}
        components={props.components} />;
};
