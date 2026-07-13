import * as React from "react";

export const RowsContext = React.createContext<true | null>(null);

export const useRowsContext = (): true | null => {
    return React.useContext(RowsContext);
};
