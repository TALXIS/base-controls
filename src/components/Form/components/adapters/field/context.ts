import React from "react";

export const FieldContext = React.createContext<string | null>(null);

export const useFieldName = (): string | null => {
    return React.useContext(FieldContext);
}