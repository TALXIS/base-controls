import * as React from "react";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../grid/useGridService";
import { IGridFilteringEvents } from "./GridFiltering";
import { FilterCallout } from "./FilterCallout";
import { IFilterCalloutProps } from "./moduleComponents";

/**
 * Shows the filter callout while this module says the column's filter is open.
 *
 * The open column lives on the module rather than in the header, so a menu entry can open a callout the
 * header knows nothing about — and the header renders this unconditionally, getting nothing back until
 * there is something to show.
 */
export const FilterCalloutHost = (props: IFilterCalloutProps) => {
    const filtering = useGridService('filtering')!;
    const [openColumnName, setOpenColumnName] = React.useState(filtering.getOpenColumnName());

    //both events, one read: what is open is the module's answer rather than something rebuilt from the
    //event that was dispatched
    useEventEmitter<IGridFilteringEvents>(filtering.events, ['onFilterOpened', 'onFilterClosed'],
        (() => setOpenColumnName(filtering.getOpenColumnName())) as IGridFilteringEvents['onFilterOpened']);

    if (openColumnName !== props.column.name) {
        return null;
    }
    return <FilterCallout column={props.column} target={props.target} onDismiss={() => filtering.closeFilter()} />;
};
