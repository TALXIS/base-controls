import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IAlignment } from "@utils";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";

//a total reads from the right whichever way the column it totals reads
const RIGHT_ALIGNED = { raw: 'right' as IAlignment };

/** What a column that totals something draws in a group's row: what that group adds up to. */
export const AggregateCell = (props: ICellRendererParams<IRecord>) => {
    //this cell is drawn for a column the aggregation module totals, so the module is there
    const aggregation = useGridService('aggregation')!;
    //the selector draws this only for a group row, which is a row with a record of its own
    const record = props.data!;

    return <Grid.Cell.Field record={record} name={aggregation.getAggregateValueColumnName(record, props.colDef!.colId!)}>
        <Grid.Cell.Renderer {...props} components={{
            control: {
                onRenderControl: (controlProps, defaultRender) => defaultRender({
                    ...controlProps,
                    parameters: { ...controlProps.parameters, ColumnAlignment: RIGHT_ALIGNED },
                })
            }
        }} />
    </Grid.Cell.Field>;
};
