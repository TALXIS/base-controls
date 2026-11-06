import { useEffect } from "react";
import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { DatasetControlUi, IDatasetControlUiPaginationComponents } from "../../ui";
import { useDataProvider } from "@data";
import { useProvideDatasetControlPart } from "../root";
import { useDatasetControlRegion } from "../region";
import { PAGINATION_LABELS } from "./labels";
import { DatasetControlPagination, IDatasetControlPaginationEvents } from "../../runtime/parts/pagination/DatasetControlPagination";

/** Props for `DatasetControl.Pagination`. */
export interface IPaginationProps {
    /** Replacements for the pagination's slots. */
    components?: Partial<IDatasetControlUiPaginationComponents>;
}

/** Moves between the provider's pages. */
export const Pagination = (props: IPaginationProps) => {
    const provider = useDataProvider();
    const pagination = useProvideDatasetControlPart('pagination', () => new DatasetControlPagination({ provider }));
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
