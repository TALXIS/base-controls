import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderRequiredMarkerComponents, IColumnHeaderRequiredMarkerComponents } from "./components";

export interface IColumnHeaderRequiredMarkerProps {
    components?: Partial<IColumnHeaderRequiredMarkerComponents>;
}

/** What says the column asks for a value. */
export const ColumnHeaderRequiredMarker = (props: IColumnHeaderRequiredMarkerProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderRequiredMarkerComponents, ...props.components };

    return components.onRenderRequiredMarker({ isRequired: header.isRequired() });
};
