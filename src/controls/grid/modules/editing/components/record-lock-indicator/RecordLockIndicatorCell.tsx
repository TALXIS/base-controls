import { ICellRendererParams } from "ag-grid-community";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellEmptyRenderer } from "../../../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { RecordLockIcon } from "./record-lock-icon/RecordLockIcon";
import { IRecordLockIndicatorCellComponents } from "./components";

export interface IRecordLockIndicatorCellProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IRecordLockIndicatorCellComponents;
}

/** The cell a row says in that its record is locked as a whole. */
export const RecordLockIndicatorCell = (props: IRecordLockIndicatorCellProps) => {
    const components = props.components ?? {};

    if (props.node.rowPinned) {
        return <CellEmptyRenderer {...props} />;
    }
    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordLockIcon components={components.lockIcon} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
