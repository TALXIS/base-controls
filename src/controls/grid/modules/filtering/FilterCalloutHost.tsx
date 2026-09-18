import * as React from "react";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../useGridService";
import { IGridFilteringEvents } from "./GridFiltering";
import { FilterCallout } from "./FilterCallout";
import { IFilterCalloutProps } from "./moduleComponents";

/** Shows the filter callout while this module says the column's filter is open. */
export const FilterCalloutHost = (props: IFilterCalloutProps) => {
    const filtering = useGridService('filtering')!;
    const [openColumnName, setOpenColumnName] = React.useState(filtering.getOpenColumnName());

    //both events, one read: what is open is the module's answer
    useEventEmitter<IGridFilteringEvents>(filtering.events, ['onFilterOpened', 'onFilterClosed'],
        (() => setOpenColumnName(filtering.getOpenColumnName())) as IGridFilteringEvents['onFilterOpened']);

    if (openColumnName !== props.column.name) {
        return null;
    }
    return <FilterCallout column={props.column} target={props.target} onDismiss={() => filtering.closeFilter()} />;
};
