import { useMemo } from "react";
import { ProgressIndicator } from "@fluentui/react";
import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { Grid, IGridValueRenderer, useGridField } from "@controls/grid";
import { getPercentCompleteCellStyles } from "./styles";

const PercentCompleteProgress = () => {
    const field = useGridField();
    const styles = useMemo(() => getPercentCompleteCellStyles(), []);
    const value: number = field?.getValue() ?? 0;

    return <ProgressIndicator
        className={styles.progress}
        styles={{ itemProgress: styles.itemProgress }}
        barHeight={5}
        percentComplete={value / 100}
        description={`${value}%`} />;
};

const onRenderControl = (controlProps: IGridValueRenderer, defaultRender: (controlProps: IGridValueRenderer) => JSX.Element | null) => {
    return controlProps.parameters.CellType.raw === 'editor' ? defaultRender(controlProps) : <PercentCompleteProgress />;
};

/** The percent complete cell: a progress bar, edited as a number. */
export const PercentCompleteCell = (props: ICellRendererParams<IRecord>) => {
    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ columnControl: { onRenderControl } }} />
    </Grid.Cell.Field>;
};
