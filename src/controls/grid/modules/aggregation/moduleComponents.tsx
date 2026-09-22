import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { AggregateCell, TotalCell } from "./components";

/** The replaceable parts of the totals. */
export interface IGridAggregationComponents {
    /** What a column that totals something draws in the row pinned under the rest. */
    onRenderTotalCell: (props: ICellRendererParams<IRecord>) => JSX.Element;
    /** What a column that totals something draws in a group's row. */
    onRenderAggregateCell: (props: ICellRendererParams<IRecord>) => JSX.Element;
}

/** The defaults for {@link IGridAggregationComponents}. */
export const GridAggregationComponents: IGridAggregationComponents = {
    onRenderTotalCell: props => <TotalCell {...props} />,
    onRenderAggregateCell: props => <AggregateCell {...props} />,
};
