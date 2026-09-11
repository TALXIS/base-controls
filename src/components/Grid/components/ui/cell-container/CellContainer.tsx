import { useMemo } from "react";
import { ThemeProvider, ThemeProviderProps } from "@fluentui/react";
import { getClassNames } from "@utils";
import { CELL_CONTAINER_CLASS_NAME, getCellContainerStyles } from "./styles";

export interface ICellContainerProps extends ThemeProviderProps { }

/** The element a cell is drawn in: a `ThemeProvider`, so a cell's theme reaches its content through it. */
export const CellContainer = (props: ICellContainerProps) => {
    const { className, ...themeProviderProps } = props;
    const styles = useMemo(() => getCellContainerStyles(), []);

    return <ThemeProvider {...themeProviderProps} className={getClassNames([CELL_CONTAINER_CLASS_NAME, styles.cellContainer, className])} />;
};
