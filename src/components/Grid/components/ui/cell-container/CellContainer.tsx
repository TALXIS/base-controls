import { ThemeProvider, ThemeProviderProps } from "@fluentui/react";

export interface ICellContainerProps extends ThemeProviderProps { }

/** The element a cell is drawn in: a `ThemeProvider`, so a cell's theme reaches its content through it. */
export const CellContainer = (props: ICellContainerProps) => {
    return <ThemeProvider {...props} />;
};
