import { useMemo } from "react";
import { Icon, Text, useTheme } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import { useTaskGridRuntime } from "@controls/task-grid/context";
import { getChecklistCellStyles } from "./styles";

const ChecklistSummary = () => {
    const theme = useTheme();
    const styles = useMemo(() => getChecklistCellStyles(theme), [theme]);
    const provider = useTaskGridRuntime().services.get('checklistModule').provider;
    const taskId = useGridCell().getRecord().getRecordId();
    const { rerender } = useRerender();
    useEventEmitter(provider.events, 'onAfterChecklistRefreshed', (refreshedTaskIds: string[]) => {
        if (refreshedTaskIds.includes(taskId)) {
            rerender();
        }
    });
    const items = provider.getItems(taskId);

    if (items.length === 0) {
        return null;
    }
    const completedCount = items.filter(item => item.isCompleted).length;
    return <div className={styles.root}>
        <Icon iconName='Completed' className={completedCount === items.length ? styles.iconCompleted : styles.icon} />
        <Text>{completedCount}/{items.length}</Text>
    </div>;
};

/** How far a task's checklist has got: a check that turns green once every item is done, and `done/total`. */
export const ChecklistCell = (props: IGridCellParams) => <Grid.Cell.Root {...props}>
    <Grid.Cell.Theme>
        <Grid.Cell.Container>
            <Grid.Cell.Loading>
                <Grid.Cell.Control>
                    <ChecklistSummary />
                </Grid.Cell.Control>
            </Grid.Cell.Loading>
        </Grid.Cell.Container>
    </Grid.Cell.Theme>
</Grid.Cell.Root>;
