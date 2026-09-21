import { useLayoutEffect } from "react";
import { ITheme, ThemeContext } from "@theme";
import { useGridColumnHeader } from "../root/context";

export interface IColumnHeaderThemeProps {
    /** The seed the header's theme is generated from, in place of the grid's own. */
    theme?: ITheme;
    children?: React.ReactNode;
}

/** What a column header and everything drawn in it is drawn in. */
export const ColumnHeaderTheme = (props: IColumnHeaderThemeProps) => {
    const header = useGridColumnHeader();
    //set before it is asked for, here and anywhere else the header's theme is read this render
    header.getTheme().setSeed(props.theme);
    const theme = header.getTheme().getValue();
    const element = header.getElement();

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
