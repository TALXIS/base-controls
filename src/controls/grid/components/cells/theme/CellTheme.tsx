import { useLayoutEffect } from "react";
import { ITheme, ThemeContext } from "@utils";
import { useGridCell } from "../root/context";

export interface ICellThemeProps {
    /** What the cell's theme is worked out from, where the grid's own — striped by row — is not it. */
    theme?: ITheme;
    children?: React.ReactNode;
}

/** What a cell and everything drawn in it is drawn in. */
export const CellTheme = (props: ICellThemeProps) => {
    const cell = useGridCell();
    //set before it is asked for, here and anywhere else the cell's theme is read this render
    cell.getTheme().setSeed(props.theme);
    const theme = cell.getTheme().get();
    const element = cell.getElement();

    //the element is AG Grid's, so the colours go on it rather than on anything of the grid's own
    useLayoutEffect(() => {
        if (!element) {
            return;
        }
        element.style.backgroundColor = theme.semanticColors.bodyBackground;
        element.style.color = theme.semanticColors.bodyText;
    }, [element, theme]);

    return <ThemeContext theme={theme}>{props.children}</ThemeContext>;
};
