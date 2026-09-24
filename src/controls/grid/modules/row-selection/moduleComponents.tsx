import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { SelectionCell } from "./components/selection-cell/SelectionCell";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";
import { SelectionHeader } from "./components/selection-header/SelectionHeader";

/** The replaceable parts of selection. */
export interface IGridSelectionComponents {
    /** The checkbox in a row. */
    onRenderCell: (props: ICellRendererParams<IRecord>) => JSX.Element;
    /** The select-all checkbox in the header. */
    onRenderHeader: (props: IColumnHeaderParams) => JSX.Element;
}

/** The defaults for {@link IGridSelectionComponents}. */
export const GridSelectionComponents: IGridSelectionComponents = {
    onRenderCell: (props) => <SelectionCell {...props as any} />,
    onRenderHeader: (props) => <SelectionHeader {...props} />,
};
