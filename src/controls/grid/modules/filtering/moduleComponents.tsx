import { Icon, IIconProps } from "@fluentui/react";
import { FilterCalloutHost } from "./FilterCalloutHost";

/** The replaceable parts of filtering. */
export interface IGridFilteringComponents {
    /** The callout a column's filter is set in, drawn over the grid while one is open. */
    onRenderFilterCallout: () => JSX.Element | null;
    /** What a filtered column shows in its header. */
    onRenderFilterIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link IGridFilteringComponents}. */
export const GridFilteringComponents: IGridFilteringComponents = {
    onRenderFilterCallout: () => <FilterCalloutHost />,
    onRenderFilterIcon: props => <Icon {...props} />,
};
