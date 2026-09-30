import { useState } from "react";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../../../useGridService";
import { IGridFilteringEvents } from "../../GridFiltering";
import { FilterCallout } from "../filter-callout/FilterCallout";

/** Shows the filter callout for whichever column this module says has one open. */
export const FilterCalloutHost = () => {
    const filtering = useGridService('filtering')!;
    const provider = useGridService('provider');
    const [openColumnName, setOpenColumnName] = useState(filtering.getOpenColumnName());

    //both events re-read what the module says is open
    useEventEmitter<IGridFilteringEvents>(filtering.events, ['onFilterOpened', 'onFilterClosed'], (() => setOpenColumnName(filtering.getOpenColumnName())) as IGridFilteringEvents['onFilterOpened']);

    const column = openColumnName ? provider.getColumnsMap()[openColumnName] : undefined;
    if (!column) {
        return null;
    }
    //keyed by column so switching columns drops the previous draft
    return <FilterCallout
        key={column.name}
        column={column}
        target={filtering.getOpenTarget()}
        onDismiss={() => filtering.closeFilter()}
        components={filtering.components.filterCallout} />;
};
