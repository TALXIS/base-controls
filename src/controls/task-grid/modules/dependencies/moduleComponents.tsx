import * as React from "react";
import { IDependenciesComponents } from "../interfaces";
import { DependenciesCellRenderer } from "./cell-renderer";

/** The defaults for {@link IDependenciesComponents}. */
export const DependenciesComponents: IDependenciesComponents = {
    onRenderCell: (props) => <DependenciesCellRenderer {...props} />,
};
