import { useGridCell } from "../../cell-host/context";
import { ControlComponents, IControlComponents } from "./components";

export interface IControlAdapterProps {
    components?: Partial<IControlComponents>;
}

/**
 * What a cell draws for its value.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellHost`. What it draws is the cell's value
 * for now; the control that decides how a value is drawn comes behind these same slots.
 */
export const Control = (props: IControlAdapterProps) => {
    const cell = useGridCell();
    const components = { ...ControlComponents, ...props.components };

    return components.onRenderControl({
        children: cell.getFormattedValue(),
        alignment: cell.getColDef().propBag?.alignment,
    });
};
