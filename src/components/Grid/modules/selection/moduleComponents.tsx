import * as React from "react";
import { ICellRendererParams, IHeaderParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { SelectionCell } from "./components/selection-cell/SelectionCell";
import { RecordSelectionCheckBox } from "./components/selection-header/RecordSelectionCheckbox";

/** The replaceable parts of selection. Override through `createSelectionModule({ components })`. */
export interface IGridSelectionComponents {
    /** The checkbox in a row. */
    onRenderCell: (props: ICellRendererParams<IRecord>) => JSX.Element;
    /** The select-all checkbox in the header. */
    onRenderHeader: (props: IHeaderParams<IRecord>) => JSX.Element;
}

/** The defaults for {@link IGridSelectionComponents}. */
export const GridSelectionComponents: IGridSelectionComponents = {
    onRenderCell: (props) => <SelectionCell {...props as any} />,
    onRenderHeader: (props) => <RecordSelectionCheckBox {...props as any} />,
};
