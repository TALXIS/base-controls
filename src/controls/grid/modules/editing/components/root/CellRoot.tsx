import { useContext } from "react";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../../useGridService";
import { CellRoot as GridCellRoot, ICellRootProps as IGridCellRootProps } from "../../../../components/cells/root/CellRoot";
import { GridCellContext } from "../../../../components/cells/root/context";
import { IGridEditedCell, IGridEditingEvents } from "../../GridEditing";

export interface ICellRootProps extends Omit<IGridCellRootProps, 'takesInput'> {
    /** Whether this is the cell AG Grid opened over the one that was there. */
    isEditor?: boolean;
}

//both sides of the change redraw: `AutoFocus` is whether this cell is edited
const EditedCellRedraw = () => {
    const cell = useContext(GridCellContext)!;
    const editing = useGridService('editing');
    const isThisCell = (edited: IGridEditedCell | undefined) => {
        return edited?.recordId === cell.getRecord().getRecordId() && edited?.columnName === cell.getColumnName();
    };

    useEventEmitter<IGridEditingEvents>(editing?.events, 'onEditedCellChanged', (previous, next) => {
        if (isThisCell(previous) || isThisCell(next)) {
            cell.render();
        }
    });
    return null;
};

/** A cell that can be edited: an editor, or a one-click column taking input where it stands. */
export const CellRoot = (props: ICellRootProps) => {
    const { isEditor, children, ...rootProps } = props;
    const takesInput = !!isEditor || !!props.colDef?.settings?.cell?.oneClickEdit;

    return <GridCellRoot {...rootProps} takesInput={takesInput}>
        <EditedCellRedraw />
        {children}
    </GridCellRoot>;
};
