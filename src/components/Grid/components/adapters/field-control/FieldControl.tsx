import { IRecord, IRecordEvents } from "@talxis/client-libraries";
import { GridCellRenderer } from "@components/GridCellRenderer";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../services/rows";
import { useGridControl } from "../../../useGridControl";
import { CellHost } from "../../cell-host";
import { ICellProps } from "../../interfaces";

export type IFieldControlProps = ICellProps;

/**
 * A cell's value, drawn, and what tells it to redraw.
 *
 * Owns the subscriptions on this path, because the value and the row's height are what AG Grid cannot
 * refresh promptly. Which control draws the value is the cell's own `GridControl`'s to decide.
 */
export const FieldControl = (props: IFieldControlProps) => {
    const { editing = false, ...cellProps } = props;
    const { record, baseColumn: column } = cellProps;
    const control = useGridControl(record, column.name, editing);
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (fieldName: string) => {
        rerender();
    });

    const controlProps = control.getControlProps();
    return <CellHost {...props}>
        {control.isCustomRendererEnabled()
            ? <LegacyNestedControlRenderer controlProps={controlProps} cellProps={cellProps} control={control} />
            : <GridCellRenderer {...controlProps} />}
    </CellHost>;
};
