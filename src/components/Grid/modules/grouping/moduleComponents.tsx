import * as React from "react";
import { Icon } from "@fluentui/react";
import { GroupExpandCollapseHeader } from "./components";

/** The replaceable parts of grouping. Override through `createGroupingModule({ components })`. */
export interface IGridGroupingComponents {
    /** What a column the rows are grouped by shows in its header, before the name. */
    onRenderGroupingIcon: () => JSX.Element;
    /** The header that opens and closes the groups a level at a time. */
    onRenderExpansionHeader: () => JSX.Element;
}

/** The defaults for {@link IGridGroupingComponents}. */
export const GridGroupingComponents: IGridGroupingComponents = {
    onRenderGroupingIcon: () => <Icon iconName='GroupList' />,
    onRenderExpansionHeader: () => <GroupExpandCollapseHeader />,
};
