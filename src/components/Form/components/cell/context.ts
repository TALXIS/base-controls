import * as React from "react";

export interface IFormCellContextValue {
    cellId?: string;
    showLabel?: boolean;
    visible?: boolean;
    colspan?: number;
    rowspan?: number;
    userspacer?: boolean;
}

export const FormCellContext = React.createContext<IFormCellContextValue | null>(null);

export const useFormCellContext = (): IFormCellContextValue => {
    const context = React.useContext(FormCellContext);
    if (context === null) {
        throw new Error("[Form] Control must be rendered inside Cell.");
    }

    return context;
};
