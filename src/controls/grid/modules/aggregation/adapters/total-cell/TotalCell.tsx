import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellField } from "../../../../adapters/cells/field/CellField";
import { CellRoot } from "../../../../adapters/cells/root/CellRoot";
import { CellTheme } from "../../../../adapters/cells/theme/CellTheme";
import { CellContainer } from "../../../../adapters/cells/container/CellContainer";
import { CellLoading } from "../../../../adapters/cells/loading/CellLoading";
import { CellControl } from "../../../../adapters/cells/control/CellControl";
import { CellCommands } from "../../../../adapters/cells/commands/CellCommands";
import { useGridModule } from "../../../../useGridModule";
import { TotalValue } from "../total-value/TotalValue";
import { ITotalCellComponents } from "./components";

export interface ITotalCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ITotalCellComponents;
}

/** What a column that totals something draws in the row pinned under the rest. */
export const TotalCell = (props: ITotalCellProps) => {
    //the aggregation module is registered wherever this cell draws
    const aggregation = useGridModule('aggregation');
    const components = { ...aggregation.components.totalCell, ...props.components };
    //the selector draws this only for the total row, so the record is there
    const record = props.data!;

    return <CellField record={record} name={aggregation.getAggregateValueColumnName(record, props.colDef!.colId!)}>
        <CellRoot {...props}>
            <CellTheme theme={props.theme}>
                <CellContainer components={components.container}>
                    <CellLoading components={components.loading}>
                        <CellControl>
                            <TotalValue components={components.totalValue} />
                        </CellControl>
                        <CellCommands components={components.commands} />
                    </CellLoading>
                </CellContainer>
            </CellTheme>
        </CellRoot>
    </CellField>;
};
