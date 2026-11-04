import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { useLabels } from "@labels";
import { Grid, IGridValueRenderer, useGridCell, useGridField, useGridModule } from "@controls/grid";
import { CHECK_LIST_LABELS } from "../../../../labels";
import { CompletionCheckboxUi, ICompletionCheckboxUiComponents } from "../../ui/completion-checkbox";
import { ICompletionCellComponents } from "./components";

export interface ICompletionCellProps extends ICellRendererParams<IRecord> {
    components?: ICompletionCellComponents;
}

const CompletionCheckbox = (props: { components?: Partial<ICompletionCheckboxUiComponents> }) => {
    const cell = useGridCell();
    const field = useGridField();
    const checkList = useGridModule('checkList');
    const labels = useLabels(CHECK_LIST_LABELS);
    const record = cell.getRecord();

    if (!field || !checkList.isItem(record)) {
        return null;
    }
    const isCompleted = checkList.isCompleted(record);

    return <CompletionCheckboxUi
        isChecked={isCompleted}
        label={labels.get('checkList.markItemFinished')}
        isDisabled={cell.isLocked()}
        onToggle={() => field.setValue(!isCompleted)}
        components={props.components} />;
};

/** The cell an item is ticked off in. */
export const CompletionCell = (props: ICompletionCellProps) => {
    const { checkbox, ...components } = props.components ?? {};
    const onRenderValue = components.columnControl?.onRenderControl ?? ((controlProps, defaultRender) => defaultRender(controlProps));

    //an override of the column's control still gets the checkbox as its default
    const onRenderControl = (controlProps: IGridValueRenderer) => onRenderValue(controlProps, () => <CompletionCheckbox components={checkbox} />);

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ ...components, columnControl: { onRenderControl } }} />
    </Grid.Cell.Field>;
};
