import * as React from "react";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../useGridService";
import { IGridFilteringEvents } from "./GridFiltering";
import { FilterCallout } from "./FilterCallout";

/** Shows the filter callout for whichever column this module says has one open. */
export const FilterCalloutHost = () => {
    const filtering = useGridService('filtering')!;
    const provider = useGridService('provider');
    const [openColumnName, setOpenColumnName] = React.useState(filtering.getOpenColumnName());

    //both events, one read: what is open is the module's answer
    useEventEmitter<IGridFilteringEvents>(filtering.events, ['onFilterOpened', 'onFilterClosed'], (() => setOpenColumnName(filtering.getOpenColumnName())) as IGridFilteringEvents['onFilterOpened']);

    const column = openColumnName ? provider.getColumnsMap()[openColumnName] : undefined;
    if (!column) {
        return null;
    }
    return <FilterCallout 
        column={column} 
        target={filtering.getOpenTarget()} onDismiss={() => filtering.closeFilter()} />;
};
