import { ColumnHeaderUi, IColumnHeaderUiRequiredMarkerProps } from "../ui";

/** The replaceable pieces of what says a column asks for a value. */
export interface IColumnHeaderRequiredMarkerComponents {
    /** The mark itself, drawn where the column asks for one. `ColumnHeaderUi.RequiredMarker` draws it, and `IColumnHeaderUiRequiredMarkerProps` is what it takes. */
    onRenderRequiredMarker: (props: IColumnHeaderUiRequiredMarkerProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderRequiredMarkerComponents}. */
export const ColumnHeaderRequiredMarkerComponents: IColumnHeaderRequiredMarkerComponents = {
    onRenderRequiredMarker: props => <ColumnHeaderUi.RequiredMarker {...props} />,
};
