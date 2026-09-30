import { Icon, IIconProps } from "@fluentui/react";
import type { IFilteringUiCalloutComponents } from "./components/ui";

/** The replaceable pieces of the icon a filtered column shows in its header. */
export interface IGridFilteringIconComponents {
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

/** The defaults for {@link IGridFilteringIconComponents}. */
export const GridFilteringIconComponents: IGridFilteringIconComponents = {
    onRenderIcon: props => <Icon {...props} />,
};

/** The replaceable parts of what filtering draws, by the piece they belong to. */
export interface IGridFilteringComponents {
    /** What a filtered column shows in its header. */
    filterIcon?: Partial<IGridFilteringIconComponents>;
    /** The callout a column's filter is set in, drawn over the grid while one is open. */
    filterCallout?: Partial<IFilteringUiCalloutComponents>;
}
