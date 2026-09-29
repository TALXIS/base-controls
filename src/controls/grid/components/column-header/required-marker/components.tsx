import { ColumnHeaderUi, IColumnHeaderUiRequiredMarkerProps } from "../ui";

/** The replaceable pieces of what says a column asks for a value. */
export interface IColumnHeaderRequiredMarkerComponents {
    /** The mark itself, `ColumnHeaderUi.RequiredMarker` by default. */
    onRenderRequiredMarker: (props: IColumnHeaderUiRequiredMarkerProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderRequiredMarkerComponents}. */
export const ColumnHeaderRequiredMarkerComponents: IColumnHeaderRequiredMarkerComponents = {
    onRenderRequiredMarker: props => <ColumnHeaderUi.RequiredMarker {...props} />,
};
