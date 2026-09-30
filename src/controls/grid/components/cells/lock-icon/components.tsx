import { CellUi, ICellUiUneditableIconProps } from "../ui";

/** The replaceable pieces of what says a cell cannot be edited. */
export interface ICellUneditableIconComponents {
    /** The icon itself, `CellUi.UneditableIcon` by default. */
    onRenderUneditableIcon: (props: ICellUiUneditableIconProps) => JSX.Element;
}

/** The defaults for {@link ICellUneditableIconComponents}. */
export const CellUneditableIconComponents: ICellUneditableIconComponents = {
    onRenderUneditableIcon: props => <CellUi.UneditableIcon {...props} />,
};
