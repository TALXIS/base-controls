import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderRequiredMarkerComponents, IGridColumnHeaderRequiredMarkerComponents } from "./components";

export interface IGridColumnHeaderRequiredMarkerProps {
    components?: Partial<IGridColumnHeaderRequiredMarkerComponents>;
}

/** What says the column asks for a value. */
export const ColumnHeaderRequiredMarker = (props: IGridColumnHeaderRequiredMarkerProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderRequiredMarkerComponents, ...props.components };

    return components.onRenderRequiredMarker({ isRequired: header.isRequired() });
};
