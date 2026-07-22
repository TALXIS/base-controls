import React from "react";

export const FieldContext = React.createContext<string | null>(null);

export const useFieldContext = (): string | null => {
    return React.useContext(FieldContext);
}