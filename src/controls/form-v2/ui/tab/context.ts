import * as React from "react";

export interface IFormV2UiTabContext {
    columnsPerRow: number;
}

export const FormV2UiTabContext = React.createContext<IFormV2UiTabContext | null>(null);

export const useFormV2UiTabContext = (): IFormV2UiTabContext | null => {
    return React.useContext(FormV2UiTabContext);
};
