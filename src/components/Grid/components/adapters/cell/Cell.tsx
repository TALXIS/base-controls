import { CellErrorBoundary } from "@components/error-boundary";
import { useGridControl } from "../../../useGridControl";
import { useGridService } from "../../../useGridService";
import { ICellProps } from "../../interfaces";
import { CellComponents, ICellComponents } from "./components";

export interface ICellAdapterProps extends ICellProps {
    components?: Partial<ICellComponents>;
}

/**
 * A field's cell, as AG Grid asks for it.
 *
 * Expects the column to name a field the record has. A group, a total, an action column and the checkbox
 * are not fields and are not this - each brings an adapter of its own.
 */
export const Cell = (props: ICellAdapterProps) => {
    //the slot map off, so what is left is exactly what a slot is handed
    const { components: componentOverrides, ...cellProps } = props;
    const { record, baseColumn: column } = cellProps;
    const control = useGridControl(record, column.name);
    const rows = useGridService('rows');
    const components = { ...CellComponents, ...componentOverrides };
    const { loading, isResizable } = control.getField();

    //the cell's theme is the host's to apply, which is where every cell now gets one
    return components.onRenderCell({
        alignment: column.alignment,
        resizeOptions: {
            resizable: isResizable,
            height: isResizable ? rows.getHeight(record) : undefined,
            onResizeEnd: height => rows.setHeight(record, height),
        },
        children: <>
            {loading && components.onRenderLoading()}
            {!loading && <CellErrorBoundary>{components.onRenderControl(cellProps)}</CellErrorBoundary>}
            {components.onRenderNotifications({ record: record, column: column })}
        </>,
    });
};
