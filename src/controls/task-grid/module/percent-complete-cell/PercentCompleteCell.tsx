import { useMemo } from "react";
import { ProgressIndicator } from "@fluentui/react";
import { Grid, ICellRendererComponents, IGridCellParams, IGridValueRenderer } from "@controls/grid";
import { getPercentCompleteCellStyles } from "./styles";

const PercentCompleteValue = (props: IGridValueRenderer) => {
    const styles = useMemo(() => getPercentCompleteCellStyles(), []);
    const value: number | null = props.parameters.value ?? null;

    return <ProgressIndicator
        barHeight={5}
        styles={{ root: styles.root, itemProgress: styles.itemProgress, itemDescription: styles.itemDescription }}
        description={`${value ?? 0}%`}
        percentComplete={(value ?? 0) / 100} />;
};

const COMPONENTS: ICellRendererComponents = {
    columnControl: { onRenderControl: props => <PercentCompleteValue {...props} /> },
};

/** A numeric cell drawn as a progress bar. */
export const PercentCompleteCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={COMPONENTS} />
</Grid.Cell.Field>;
