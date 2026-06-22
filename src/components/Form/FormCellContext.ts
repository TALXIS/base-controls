import * as React from "react";

export interface IFormCellContextValue {
    datafieldname?: string;
    controlId?: string;
    disabled?: boolean;
}

export const FormCellContext = React.createContext<IFormCellContextValue>({});
