import { useMemo } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { Grid } from "@controls/grid";
import { useTaskGridService } from "../../../useTaskGrid";
import { useTaskGridContext } from "../../../context";
import { AddTaskButtonComponents, IAddTaskCellComponents } from "./components";
import { getAddTaskCellStyles } from "./styles";

export interface IAddTaskCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IAddTaskCellComponents;
}

/** The cell with the button that adds a subtask under the row's task. */
export const AddTaskCell = (props: IAddTaskCellProps) => {
    const { runtime, components: taskGridComponents } = useTaskGridContext();
    const provider = useTaskGridService('provider');
    const styles = useMemo(() => getAddTaskCellStyles(), []);
    const components = { ...taskGridComponents.addTaskCell, ...props.components };
    const button = { ...AddTaskButtonComponents, ...components.button };
    const recordId = props.data?.getRecordId();
    const operations = runtime.services.get('taskOperations');
    //the lock column already says an inactive task cannot change
    const canAddTask = !!recordId && !props.node.rowPinned && provider.isRecordActive(recordId);

    if (!canAddTask) {
        return <Grid.Cell.EmptyRenderer {...props} components={{ container: components.container }} />;
    }
    const label = operations.getLabels().getLocalizedString('addChild');
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme theme={props.theme}>
            <Grid.Cell.Container components={components.container}>
                {button.onRenderButton({
                    className: styles.addTaskButton,
                    title: label,
                    ariaLabel: label,
                    iconProps: { iconName: 'Add' },
                    onClick: () => operations.createTask(recordId),
                })}
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>;
};
