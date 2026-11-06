import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { GridValueRenderer, IGridValueRenderer, Grid, useGridModule } from "@controls/grid";
import { IChecklistUiNameCellComponents, ChecklistUiNameCell } from "../../ui/name-cell";
import { INameCellComponents } from "./components";

export interface INameCellProps extends ICellRendererParams<IRecord> {
    components?: INameCellComponents;
}

const NameValue = (props: IGridValueRenderer & { nameComponents?: Partial<IChecklistUiNameCellComponents> }) => {
    const { nameComponents, ...valueProps } = props;
    const checkList = useGridModule('checklist');
    const isCompleted = checkList.isCompleted(valueProps.parameters.Record.raw);
    return <GridValueRenderer {...valueProps} components={{ ...valueProps.components, onRenderContainer: containerProps => <ChecklistUiNameCell {...containerProps} isCompleted={isCompleted} components={nameComponents} /> }} />;
};

/** The cell of an item's name, struck through once the item is finished. */
export const NameCell = (props: INameCellProps) => {
    const { name, ...components } = props.components ?? {};
    const onRenderValue = components.columnControl?.onRenderControl ?? ((controlProps, defaultRender) => defaultRender(controlProps));

    //an override of the column's control still gets the struck-through name as its default
    const onRenderControl = (controlProps: IGridValueRenderer) => onRenderValue(controlProps, valueProps => <NameValue {...valueProps} nameComponents={name} />);

    return <Grid.Cell.Field record={props.data!} name={props.colDef!.colId!}>
        <Grid.Cell.Renderer {...props} components={{ ...components, columnControl: { onRenderControl } }} />
    </Grid.Cell.Field>;
};
