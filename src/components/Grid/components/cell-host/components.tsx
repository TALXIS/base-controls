import { CellUi, ICellThemeProps } from "../ui";

/** The replaceable pieces of a cell's host. Override through `ICellHostProps.components`. */
export interface ICellHostComponents {
    /** What the cell's theme reaches its content through. */
    onRenderTheme: (props: ICellThemeProps) => JSX.Element;
}

/** The defaults for {@link ICellHostComponents}. */
export const CellHostComponents: ICellHostComponents = {
    onRenderTheme: props => <CellUi.Theme {...props} />,
};
