import { useGridCell } from "../../../../adapters/cells/root/context";
import { useGridField } from "../../../../adapters/cells/field";
import { useGridModule } from "../../../../useGridModule";
import { AggregationUi, IAggregationUiTotalValueComponents } from "../../ui";

export interface ITotalValueProps {
    components?: Partial<IAggregationUiTotalValueComponents>;
}

/** What the cell's column adds up to, and what that total is called. */
export const TotalValue = (props: ITotalValueProps) => {
    const cell = useGridCell();
    const field = useGridField();
    //the aggregation module is loaded wherever this cell draws
    const aggregation = useGridModule('aggregation');

    return <AggregationUi.TotalValue
        label={aggregation.getTotalLabel(cell.getColumnName())}
        value={field?.getFormattedValue() ?? undefined}
        components={props.components} />;
};
