import { Grid, ICellRendererComponents, IGridCellParams } from "@controls/grid";
import { LookupManyControl } from "../lookup-many-control";

const COMPONENTS: ICellRendererComponents = {
    columnControl: { onRenderControl: props => <LookupManyControl {...props} /> },
};

/** A lookup-many column's cell: the records it holds. */
export const LookupManyCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={COMPONENTS} />
</Grid.Cell.Field>;
