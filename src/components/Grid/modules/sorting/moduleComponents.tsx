import * as React from "react";
import { Icon } from "@fluentui/react";

export interface ISortIconProps {
    /** Which way the column is sorted. */
    descending: boolean;
}

/** The replaceable parts of sorting. Override through `createSortingModule({ components })`. */
export interface IGridSortingComponents {
    /** What a sorted column shows in its header. */
    onRenderSortIcon: (props: ISortIconProps) => JSX.Element;
}

/** The defaults for {@link IGridSortingComponents}. */
export const GridSortingComponents: IGridSortingComponents = {
    onRenderSortIcon: (props) => <Icon iconName={props.descending ? 'SortDown' : 'SortUp'} />,
};
