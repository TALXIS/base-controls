import { IRecord, IRecordEvents } from "@talxis/client-libraries";
import { GridCellRenderer } from "@components/GridCellRenderer";
import { LegacyNestedControlRenderer } from "../legacy-nested-control-renderer";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../grid/rows";
import { useGridService } from "../../../grid/useGridService";
import { ICellProps } from "../../interfaces";

export type IFieldControlProps = ICellProps;

/**
 * A cell's value, drawn, and what tells it to redraw.
 *
 * Owns the subscriptions on this path, because the value and the row's height are what AG Grid cannot
 * refresh promptly. Which control draws the value is `GridCells.getControlProps`'s to decide.
 */
export const FieldControl = (props: IFieldControlProps) => {
    const { editing = false, ...cellProps } = props;
    const { record, baseColumn: column } = cellProps;
    const cells = useGridService('cells');
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (fieldName: string) => {
        rerender();
    });

    const controlProps = cells.getControlProps(record, column, editing);
    return cells.isCustomRendererEnabled(record, column, editing)
        ? <LegacyNestedControlRenderer controlProps={controlProps} cellProps={cellProps} takesInput={editing} />
        : <GridCellRenderer {...controlProps} />;
};
