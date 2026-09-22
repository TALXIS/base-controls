import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Grid } from "../../../../namespace";

/** What a column that totals something draws in the row pinned under the rest. */
export const TotalCell = (props: ICellRendererParams<IRecord>) => {
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                dummy
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>;
};
