import * as React from "react";
import { IChecklistComponents } from "../interfaces";
import { ChecklistCellRenderer } from "./cell-renderer";

/** The defaults for {@link IChecklistComponents}. */
export const ChecklistComponents: IChecklistComponents = {
    onRenderCell: (props) => <ChecklistCellRenderer {...props} />,
};
