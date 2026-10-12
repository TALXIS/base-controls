import { useEffect, useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { DatasetControlUi, IPaginationUiComponents } from "../../ui";
import { LocalizationService, useDataProvider } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { useDatasetControlRegion } from "../region";
import { IPaginationLabels, PAGINATION_LABELS } from "./labels";
import { DatasetControlPagination, IDatasetControlPaginationEvents } from "./DatasetControlPagination";

export interface IPaginationProps {
    labels?: Partial<IPaginationLabels>;
    components?: Partial<IPaginationUiComponents>;
}

/** Moves between the provider's pages. */
export const Pagination = (props: IPaginationProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const pagination = useMemo(() => new DatasetControlPagination({ services: runtime.services, provider }), []);
    const labels = useMemo(() => new LocalizationService<IPaginationLabels>({ ...PAGINATION_LABELS, ...props.labels }), [props.labels]);
    const { rerender } = useRerender();
    const region = useDatasetControlRegion();

    useEventEmitter<IDatasetControlPaginationEvents>(pagination.events, 'onPagingChanged', rerender);
    useEffect(() => () => pagination.destroy(), []);

    return <DatasetControlUi.Pagination
        align={region === 'start' ? 'start' : 'end'}
        canMovePrevious={pagination.canMovePrevious()}
        canMoveNext={pagination.canMoveNext()}
        labels={{
            firstPageTooltip: labels.getLocalizedString('firstPageTooltip'),
            previousPageTooltip: labels.getLocalizedString('previousPageTooltip'),
            nextPageTooltip: labels.getLocalizedString('nextPageTooltip'),
            currentPage: labels.getLocalizedString('currentPage', { number: `${pagination.getPageNumber()}` }),
        }}
        onMoveFirst={() => pagination.moveFirst()}
        onMovePrevious={() => pagination.movePrevious()}
        onMoveNext={() => pagination.moveNext()}
        components={props.components} />;
};
