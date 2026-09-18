import * as React from "react";
import { ILookupManyModuleComponents } from "../interfaces";
import { LookupManyCellRenderer } from "./cell-renderer";

/** The defaults for {@link ILookupManyModuleComponents}. */
export const LookupManyModuleComponents: ILookupManyModuleComponents = {
    onRenderCell: (props) => <LookupManyCellRenderer {...props} />,
};
