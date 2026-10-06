import { Icon, IIconProps } from "@fluentui/react";
import type { IGroupCellComponents } from "./components/group-cell/components";

/** The replaceable pieces of the icon a grouped column shows in its header. */
export interface IGridGroupingIconComponents {
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

/** The defaults for {@link IGridGroupingIconComponents}. */
export const GridGroupingIconComponents: IGridGroupingIconComponents = {
    onRenderIcon: props => <Icon {...props} />,
};

/** The replaceable parts of what grouping draws, by the piece they belong to. */
export interface IGridGroupingComponents {
    /** What a column the rows are grouped by shows in its header, before the name. */
    groupingIcon?: Partial<IGridGroupingIconComponents>;
    /** What the row standing for a group draws in the column it is grouped by. */
    groupCell?: IGroupCellComponents;
}
