import * as React from "react";
import { Icon, IIconProps } from "@fluentui/react";
import { GroupExpandCollapseHeader } from "./components";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";

/** The replaceable parts of grouping. */
export interface IGridGroupingComponents {
    /** What a column the rows are grouped by shows in its header, before the name. */
    onRenderGroupingIcon: (props: IIconProps) => JSX.Element;
    /** The header that opens and closes the groups a level at a time. */
    onRenderExpansionHeader: (props: IColumnHeaderParams) => JSX.Element;
}

/** The defaults for {@link IGridGroupingComponents}. */
export const GridGroupingComponents: IGridGroupingComponents = {
    onRenderGroupingIcon: props => <Icon {...props} />,
    onRenderExpansionHeader: props => <GroupExpandCollapseHeader {...props} />,
};
