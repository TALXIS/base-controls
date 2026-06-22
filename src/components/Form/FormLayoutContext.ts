import * as React from "react";

export interface IFormLayoutContextValue {
    tabName?: string;
}

export const FormLayoutContext = React.createContext<IFormLayoutContextValue>({});
