import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";
import { TotalValue } from "../total-value";

/** What a column that totals something draws in the row pinned under the rest. */
export const TotalCell = (props: ICellRendererParams<IRecord>) => {
    //the aggregation module is registered wherever this cell draws
    const aggregation = useGridService('aggregation')!;
    //the selector draws this only for the total row, so the record is there
    const record = props.data!;

    return <Grid.Cell.Field record={record} name={aggregation.getAggregateValueColumnName(record, props.colDef!.colId!)}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container>
                    <Grid.Cell.Loading>
                        <Grid.Cell.Control components={{ onRenderControl: () => <TotalValue /> }} />
                        <Grid.Cell.Commands />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
