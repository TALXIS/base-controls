import * as React from "react";
import { ICustomColumnsComponents } from "../interfaces";
import { EditColumns } from "./edit-columns/EditColumns";

/** The defaults for {@link ICustomColumnsComponents}. */
export const CustomColumnsComponents: ICustomColumnsComponents = {
    onRenderEditColumns: (props) => <EditColumns {...props} />,
};
