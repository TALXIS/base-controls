import { ICellRendererParams } from "ag-grid-community";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellEmptyRenderer } from "../../../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { RecordSaveIndicator } from "./RecordSaveIndicator";
import { IRecordSaveUiComponents } from "./ui";

export interface IRecordSaveIndicatorCellProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IRecordSaveUiComponents;
}

/** The cell a row reports its save in, on a grid with no checkbox column. */
export const RecordSaveIndicatorCell = (props: IRecordSaveIndicatorCellProps) => {
    const components = props.components ?? {};

    //a pinned row has no save of its own to report
    if (props.node.rowPinned) {
        return <CellEmptyRenderer {...props} />;
    }
    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordSaveIndicator components={components} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
