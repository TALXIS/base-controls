import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellRoot } from "../cells/root/CellRoot";
import { CellTheme } from "../cells/theme/CellTheme";
import { CellContainer } from "../cells/container/CellContainer";
import { LockIcon } from "./lock-icon";
import { IRecordLockIndicatorCellComponents } from "./components";

export interface IRecordLockIndicatorCellProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IRecordLockIndicatorCellComponents;
}

/** The cell a row says in that its record is locked as a whole. */
export const RecordLockIndicatorCell = (props: IRecordLockIndicatorCellProps) => {
    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={props.components?.container}>
                <LockIcon components={props.components?.lockIcon} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
