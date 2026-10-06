import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellField } from "../../../../components/cells/field/CellField";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellLoading } from "../../../../components/cells/loading/CellLoading";
import { CellControl } from "../../../../components/cells/control/CellControl";
import { CellCommands } from "../../../../components/cells/commands/CellCommands";
import { useGridService } from "../../../../useGridService";
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
    const aggregation = useGridService('aggregation')!;
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
