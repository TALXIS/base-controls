import * as React from "react";
import { Icon, IIconProps } from "@fluentui/react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { GroupCell, GroupExpandCollapseHeader } from "./components";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";

/** The replaceable parts of grouping. */
export interface IGridGroupingComponents {
    /** What a column the rows are grouped by shows in its header, before the name. */
    onRenderGroupingIcon: (props: IIconProps) => JSX.Element;
    /** What the row standing for a group draws in the column it is grouped by. */
    onRenderGroupCell: (props: ICellRendererParams<IRecord>) => JSX.Element;
    /** The header that opens and closes the groups a level at a time. */
    onRenderExpansionHeader: (props: IColumnHeaderParams) => JSX.Element;
}

/** The defaults for {@link IGridGroupingComponents}. */
export const GridGroupingComponents: IGridGroupingComponents = {
    onRenderGroupingIcon: props => <Icon {...props} />,
    onRenderGroupCell: props => <GroupCell {...props} />,
    onRenderExpansionHeader: props => <GroupExpandCollapseHeader {...props} />,
};
