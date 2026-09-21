import { ITheme, ThemeContext } from "@theme";
import { useGridColumnHeader } from "../root/context";

export interface IGridColumnHeaderThemeProps {
    /** The seed the header's theme is generated from, in place of the grid's own. */
    theme?: ITheme;
    children?: React.ReactNode;
}

/** What a column header and everything drawn in it is drawn in. */
export const ColumnHeaderTheme = (props: IGridColumnHeaderThemeProps) => {
    const header = useGridColumnHeader();
    //set before it is asked for, here and anywhere else the header's theme is read this render
    header.getTheme().setSeed(props.theme);

    return <ThemeContext theme={header.getTheme().getValue()}>{props.children}</ThemeContext>;
};
