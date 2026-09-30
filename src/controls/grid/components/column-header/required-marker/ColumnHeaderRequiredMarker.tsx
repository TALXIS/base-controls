import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiRequiredMarkerComponents } from "../ui";

export interface IColumnHeaderRequiredMarkerProps {
    components?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
}

/** What says the column asks for a value. */
export const ColumnHeaderRequiredMarker = (props: IColumnHeaderRequiredMarkerProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.RequiredMarker isRequired={header.isRequired()} components={props.components} />;
};
