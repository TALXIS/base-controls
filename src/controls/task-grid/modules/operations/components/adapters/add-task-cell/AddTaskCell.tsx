import { useMemo } from "react";
import { IconButton } from "@fluentui/react";
import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { Grid } from "@controls/grid";
import { useTaskGridService } from "../../../useTaskGrid";
import { useTaskGridContext } from "../../../context";
import { getAddTaskCellStyles } from "./styles";

export interface IAddTaskCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The cell with the button that adds a subtask under the row's task. */
export const AddTaskCell = (props: IAddTaskCellProps) => {
    const { runtime } = useTaskGridContext();
    const operations = runtime.services.get('taskOperations');
    const provider = useTaskGridService('provider');
    const styles = useMemo(() => getAddTaskCellStyles(), []);
    const recordId = props.data?.getRecordId();
    //the lock column already says an inactive task cannot change
    const canAddTask = !!recordId && !props.node.rowPinned && provider.isRecordActive(recordId);

    if (!canAddTask) {
        return <Grid.Cell.EmptyRenderer {...props} />;
    }
    const label = operations.getLabels().getLocalizedString('addChild');
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme theme={props.theme}>
            <Grid.Cell.Container>
                <IconButton className={styles.addTaskButton} title={label} ariaLabel={label} iconProps={{ iconName: 'Add' }} onClick={() => operations.createTask(recordId)} />
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>;
};
