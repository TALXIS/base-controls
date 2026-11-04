import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { IAlignment } from "@core";
import { IGridValueRenderer } from "../../../../adapters/value-renderer";
import { CellField } from "../../../../adapters/cells/field/CellField";
import { CellRoot } from "../../../../adapters/cells/root/CellRoot";
import { CellTheme } from "../../../../adapters/cells/theme/CellTheme";
import { CellContainer } from "../../../../adapters/cells/container/CellContainer";
import { CellLoading } from "../../../../adapters/cells/loading/CellLoading";
import { CellControl } from "../../../../adapters/cells/control/CellControl";
import { CellColumnControl } from "../../../../adapters/cells/column-control/CellColumnControl";
import { CellCommands } from "../../../../adapters/cells/commands/CellCommands";
import { CellColumnControlComponents } from "../../../../adapters/cells/column-control/components";
import { useGridModule } from "../../../../useGridModule";
import { IAggregateCellComponents } from "./components";

//a total reads from the right whichever way the column it totals reads
const RIGHT_ALIGNED: { raw: IAlignment } = { raw: 'right' };

export interface IAggregateCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IAggregateCellComponents;
}

/** What a column that totals something draws in a group's row: what that group adds up to. */
export const AggregateCell = (props: IAggregateCellProps) => {
    //the aggregation module is registered wherever this cell draws
    const aggregation = useGridModule('aggregation');
    const components = { ...aggregation.components.aggregateCell, ...props.components };
    const onRenderControl = components.columnControl?.onRenderControl ?? CellColumnControlComponents.onRenderControl;
    //the selector draws this only for a group row, so the record is there
    const record = props.data!;

    const onRenderRightAligned = (controlProps: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => {
        return onRenderControl({ ...controlProps, parameters: { ...controlProps.parameters, ColumnAlignment: RIGHT_ALIGNED } }, defaultRender);
    };

    return <CellField record={record} name={aggregation.getAggregateValueColumnName(record, props.colDef!.colId!)}>
        <CellRoot {...props}>
            <CellTheme theme={props.theme}>
                <CellContainer components={components.container}>
                    <CellLoading components={components.loading}>
                        <CellControl components={components.control}>
                            <CellColumnControl components={{ onRenderControl: onRenderRightAligned }} />
                        </CellControl>
                        <CellCommands components={components.commands} />
                    </CellLoading>
                </CellContainer>
            </CellTheme>
        </CellRoot>
    </CellField>;
};
