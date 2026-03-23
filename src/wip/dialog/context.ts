import React from "react";
import { components, IDialogComponents } from "./components";

export const DialogComponentsContext = React.createContext<IDialogComponents>(components);

export const useDialogComponents = () => {
    return React.useContext(DialogComponentsContext);
}