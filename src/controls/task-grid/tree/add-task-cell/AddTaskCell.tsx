import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { Grid } from "@controls/grid";
import { useTaskGridService } from "../../useTaskGrid";
import { useTaskGridContext } from "../../context";
import { IAddTaskCellComponents } from "./components";
import { AddTaskButton } from "../add-task-button";

export interface IAddTaskCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IAddTaskCellComponents;
}

/** The cell with the button that adds a subtask under the row's task. */
export const AddTaskCell = (props: IAddTaskCellProps) => {
    const { runtime } = useTaskGridContext();
    const provider = useTaskGridService('provider');
    const components = props.components ?? {};
    const recordId = props.data?.getRecordId();
    //the lock column already says an inactive task cannot change
    const canAddTask = !!recordId && !props.node.rowPinned && provider.isRecordActive(recordId);

    if (!canAddTask) {
        return <Grid.Cell.EmptyRenderer {...props} components={components} />;
    }
    const label = runtime.getLabels().getLocalizedString('addChild');
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme theme={props.theme}>
            <Grid.Cell.Container components={components.container}>
                <Grid.Cell.Loading components={components.loading}>
                    <AddTaskButton label={label} onClick={() => runtime.createTask(recordId)} components={components.button} />
                    <Grid.Cell.Commands components={components.commands} />
                </Grid.Cell.Loading>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>;
};
