import { useEffect, useMemo } from "react";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { Grid, GroupingUi, IGridCellParams } from "@controls/grid";
import { useTaskGridRuntime, useTaskDataProvider } from "@controls/task-grid/context";
import { getTreeCellStyles } from "./styles";

/** The subject cell: the task's place in the tree, its chevron and its name. */
export const TreeCell = (props: IGridCellParams) => {
    const taskDataProvider = useTaskDataProvider();
    const expansion = useTaskGridRuntime().services.get('taskExpansion');
    const record: IRecord = props.data;
    const node = props.node;
    const { rerender } = useRerender();
    const recordTree = taskDataProvider.getRecordTree();
    const isFlatList = taskDataProvider.isFlatListEnabled();
    const isExpandable = !isFlatList && !!node.group;
    const indentSteps = isFlatList || (node.level === 0 && recordTree.view.isFlat()) ? 0 : node.level + (isExpandable ? 0 : 1);
    const styles = useMemo(() => getTreeCellStyles(indentSteps), [indentSteps]);

    useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        node.addEventListener('groupChanged', rerender);
        node.addEventListener('uiLevelChanged', rerender);
        return () => {
            node.removeEventListener('expandedChanged', rerender);
            node.removeEventListener('groupChanged', rerender);
            node.removeEventListener('uiLevelChanged', rerender);
        };
    }, [node]);

    return <Grid.Cell.Field record={record} name={props.colDef!.colId!}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container>
                    <Grid.Cell.Loading>
                        {indentSteps > 0 && <div className={styles.indent} />}
                        {isExpandable && <GroupingUi.Toggle isExpanded={!!node.expanded} onToggle={() => expansion.toggle(record.getRecordId())} />}
                        <Grid.Cell.LockIcon />
                        <Grid.Cell.Control>
                            <Grid.Cell.ColumnControl />
                        </Grid.Cell.Control>
                        <Grid.Cell.Commands />
                        <Grid.Cell.FieldError />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
