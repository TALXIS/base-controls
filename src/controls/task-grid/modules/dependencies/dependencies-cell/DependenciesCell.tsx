import { useMemo } from "react";
import { Icon, Text, useTheme } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { Grid, IGridCellParams, useGridCell } from "@controls/grid";
import { useTaskGridRuntime } from "@controls/task-grid/context";
import { PREDECESSORS_COLUMN_NAME, TaskDependencyDirection } from "../DependenciesProvider";
import { getDependenciesCellStyles } from "./styles";

const DependenciesSummary = () => {
    const theme = useTheme();
    const styles = useMemo(() => getDependenciesCellStyles(theme), [theme]);
    const provider = useTaskGridRuntime().services.get('dependenciesModule').provider;
    const cell = useGridCell();
    const taskId = cell.getRecord().getRecordId();
    const direction: TaskDependencyDirection = cell.getColumnName() === PREDECESSORS_COLUMN_NAME ? 'predecessors' : 'successors';
    const { rerender } = useRerender();
    useEventEmitter(provider.events, 'onAfterDependenciesRefreshed', (affectedTaskIds: string[]) => {
        if (affectedTaskIds.includes(taskId)) {
            rerender();
        }
    });
    const dependencies = direction === 'predecessors' ? provider.getPredecessors(taskId) : provider.getSuccessors(taskId);

    if (dependencies.length === 0) {
        return null;
    }
    return <div className={styles.root}>
        <Icon iconName='Link' className={styles.icon} />
        <Icon iconName={direction === 'predecessors' ? 'SortDown' : 'SortUp'} className={styles.arrow} />
        <Text>{dependencies.length}</Text>
    </div>;
};

/** How many tasks a task waits on, or how many wait on it, by the column it is drawn in. */
export const DependenciesCell = (props: IGridCellParams) => <Grid.Cell.Root {...props}>
    <Grid.Cell.Theme>
        <Grid.Cell.Container>
            <Grid.Cell.Loading>
                <Grid.Cell.Control>
                    <DependenciesSummary />
                </Grid.Cell.Control>
            </Grid.Cell.Loading>
        </Grid.Cell.Container>
    </Grid.Cell.Theme>
</Grid.Cell.Root>;
