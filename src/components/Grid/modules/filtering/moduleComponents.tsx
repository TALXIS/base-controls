import { IColumn } from "@talxis/client-libraries";
import * as React from "react";
import { Icon } from "@fluentui/react";
import { FilterCalloutHost } from "./FilterCalloutHost";

export interface IFilterCalloutProps {
    column: IColumn;
    /** What the callout is anchored to: the header the filter was opened from. */
    target: React.RefObject<HTMLDivElement>;
}

/** The replaceable parts of filtering. */
export interface IGridFilteringComponents {
    /** The callout a column's filter is set in. */
    onRenderFilterCallout: (props: IFilterCalloutProps) => JSX.Element | null;
    /** What a filtered column shows in its header. */
    onRenderFilterIcon: () => JSX.Element;
}

/** The defaults for {@link IGridFilteringComponents}. */
export const GridFilteringComponents: IGridFilteringComponents = {
    onRenderFilterCallout: (props) => <FilterCalloutHost {...props} />,
    onRenderFilterIcon: () => <Icon iconName='Filter' />,
};
