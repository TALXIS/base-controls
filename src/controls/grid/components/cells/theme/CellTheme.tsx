import { useEffect, useLayoutEffect } from "react";
import { useRerender } from "@legacy";
import { ITheme, ThemeContext } from "@utils";
import { useGridCell } from "../root/context";

export interface ICellThemeProps {
    /** The seed the cell's theme is generated from, in place of the grid's striped one. */
    theme?: ITheme;
    children?: React.ReactNode;
}

/** What a cell and everything drawn in it is drawn in. */
export const CellTheme = (props: ICellThemeProps) => {
    const cell = useGridCell();
    const { rerender } = useRerender();
    //set before it is asked for, here and anywhere else the cell's theme is read this render
    cell.getTheme().setSeed(props.theme);
    const theme = cell.getTheme().get();
    const element = cell.getElement();

    //AG Grid moves a row it sorts without rendering it again, and the stripe follows the row's index
    useEffect(() => {
        const node = cell.getNode();
        if (!node) return;
        node.addEventListener('rowIndexChanged', rerender);
        return () => node.removeEventListener('rowIndexChanged', rerender);
    }, [cell]);

    //the colours go on AG Grid's own element
    useLayoutEffect(() => {
        if (!element) {
            return;
        }
        element.style.backgroundColor = theme.semanticColors.bodyBackground;
        element.style.color = theme.semanticColors.bodyText;
    }, [element, theme]);

    return <ThemeContext theme={theme}>{props.children}</ThemeContext>;
};
