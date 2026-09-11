import React, { useMemo } from "react";
import { ThemeProvider } from "@fluentui/react";
import { GridCellTheme } from "../../../services/cells";
import { getCellThemeStyles } from "./styles";

export interface ICellThemeProps {
    theme: GridCellTheme;
    children?: React.ReactNode;
}

/** What a cell is drawn in, where that is a theme of its own rather than the grid's. */
export const CellTheme = (props: ICellThemeProps) => {
    const { theme, children } = props;
    const styles = useMemo(() => getCellThemeStyles(), []);

    //no theme where the cell is drawn in the grid's own: the provider then passes down whatever it
    //inherits rather than replacing it with a copy nothing asked for
    //
    //`applyTo='none'` so the provider paints nothing: the background is AG Grid's to draw
    return <ThemeProvider
        theme={theme.isCustom() ? theme.getValue() : undefined}
        applyTo='none'
        className={styles.themeProvider}>{children}</ThemeProvider>;
};
