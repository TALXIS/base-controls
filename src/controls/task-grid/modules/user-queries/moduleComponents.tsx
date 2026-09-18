import * as React from "react";
import { IUserQueryComponents } from "../interfaces";
import { ViewManagerDialog } from "./view-manager";
import { CreateViewDialog } from "./create-view-dialog";

/** The defaults for {@link IUserQueryComponents}. */
export const UserQueryComponents: IUserQueryComponents = {
    onRenderViewManager: (props) => <ViewManagerDialog {...props} />,
    onRenderCreateView: (props) => <CreateViewDialog {...props} />,
};
