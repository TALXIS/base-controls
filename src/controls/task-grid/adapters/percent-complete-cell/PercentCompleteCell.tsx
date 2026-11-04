import { IGridValueRenderer, Grid, useGridField } from "@controls/grid";
import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { useTaskGridContext } from "../../context";
import { ITaskGridUiPercentCompleteComponents, TaskGridUiPercentComplete } from "../../ui";
import { mergeComponentNamespaces } from "../mergeComponentNamespaces";
import { IPercentCompleteCellComponents } from "./components";

export interface IPercentCompleteCellProps extends ICellRendererParams<IRecord> {
    components?: IPercentCompleteCellComponents;
}

interface IPercentCompleteProgressProps {
    components?: Partial<ITaskGridUiPercentCompleteComponents>;
}

const PercentCompleteProgress = (props: IPercentCompleteProgressProps) => {
    const field = useGridField();
    return <TaskGridUiPercentComplete value={field?.getValue() ?? 0} components={props.components} />;
};

/** The percent complete cell, a progress bar edited as a number. */
export const PercentCompleteCell = (props: IPercentCompleteCellProps) => {
    const { progress, ...components } = mergeComponentNamespaces(useTaskGridContext().components.percentComplete, props.components);
    const onRenderEditor = components.columnControl?.onRenderControl ?? ((controlProps, defaultRender) => defaultRender(controlProps));

    const onRenderControl = (controlProps: IGridValueRenderer, defaultRender: (controlProps: IGridValueRenderer) => JSX.Element | null) => {
        return controlProps.parameters.CellType.raw === 'editor' ? onRenderEditor(controlProps, defaultRender) : <PercentCompleteProgress components={progress} />;
    };

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ ...components, columnControl: { onRenderControl } }} />
    </Grid.Cell.Field>;
};
