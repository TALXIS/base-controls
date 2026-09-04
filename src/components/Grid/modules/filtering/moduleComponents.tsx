import * as React from "react";
import { Icon } from "@fluentui/react";
import { IGridColumn } from "../../grid/columns";
import { FilterCalloutHost } from "./FilterCalloutHost";

export interface IFilterCalloutProps {
    column: IGridColumn;
    /** What the callout is anchored to: the header the filter was opened from. */
    target: React.RefObject<HTMLDivElement>;
}

/** The replaceable parts of filtering. Override through `createFilteringModule({ components })`. */
export interface IGridFilteringComponents {
    /**
     * The callout a column's filter is set in.
     *
     * Rendered by the column header on every render, whether or not a filter is open — this module owns
     * which column that is, so the default answers with nothing while none is.
     */
    onRenderFilterCallout: (props: IFilterCalloutProps) => JSX.Element | null;
    /** What a filtered column shows in its header. */
    onRenderFilterIcon: () => JSX.Element;
}

/** The defaults for {@link IGridFilteringComponents}. */
export const GridFilteringComponents: IGridFilteringComponents = {
    onRenderFilterCallout: (props) => <FilterCalloutHost {...props} />,
    onRenderFilterIcon: () => <Icon iconName='Filter' />,
};
