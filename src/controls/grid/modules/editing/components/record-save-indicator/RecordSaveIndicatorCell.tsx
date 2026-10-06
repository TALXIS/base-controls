import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { useGridService } from "../../../../useGridService";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { RecordSaveIndicator } from "./RecordSaveIndicator";

export interface IRecordSaveIndicatorCellProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The cell a row reports its save in, on a grid with no checkbox column. */
export const RecordSaveIndicatorCell = (props: IRecordSaveIndicatorCellProps) => {
    const components = useGridService('editing')?.components.recordSaveCell ?? {};

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordSaveIndicator components={components} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
