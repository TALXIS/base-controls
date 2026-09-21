import { ColumnHeaderUi, IColumnHeaderRequiredMarkerProps } from "../ui";

/** The replaceable pieces of what says a column asks for a value. */
export interface IGridColumnHeaderRequiredMarkerComponents {
    /** The mark itself, drawn where the column asks for one. `ColumnHeaderUi.RequiredMarker` draws it, and `IColumnHeaderRequiredMarkerProps` is what it takes. */
    onRenderRequiredMarker: (props: IColumnHeaderRequiredMarkerProps) => JSX.Element | null;
}

/** The defaults for {@link IGridColumnHeaderRequiredMarkerComponents}. */
export const ColumnHeaderRequiredMarkerComponents: IGridColumnHeaderRequiredMarkerComponents = {
    onRenderRequiredMarker: props => <ColumnHeaderUi.RequiredMarker {...props} />,
};
