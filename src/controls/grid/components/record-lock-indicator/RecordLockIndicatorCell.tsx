import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { useGridComponents } from "../../context";
import { CellRoot } from "../cells/root/CellRoot";
import { CellTheme } from "../cells/theme/CellTheme";
import { CellContainer } from "../cells/container/CellContainer";
import { RecordLockIcon } from "./record-lock-icon/RecordLockIcon";

export interface IRecordLockIndicatorCellProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The cell a row says in that its record is locked as a whole. */
export const RecordLockIndicatorCell = (props: IRecordLockIndicatorCellProps) => {
    const components = useGridComponents().recordLockCell ?? {};

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordLockIcon components={components.lockIcon} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
