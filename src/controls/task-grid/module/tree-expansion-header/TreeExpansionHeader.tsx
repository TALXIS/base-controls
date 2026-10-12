import { Grid, GroupingUi, IColumnHeaderParams } from "@controls/grid";
import { useTaskGridLabels, useTaskGridRuntime } from "@controls/task-grid/context";

/** Expands or collapses every task at once. */
export const TreeExpansionHeader = (props: IColumnHeaderParams) => {
    const expansion = useTaskGridRuntime().services.get('taskExpansion');
    const labels = useTaskGridLabels();

    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme>
            <GroupingUi.ExpandCollapse
                expandTitle={labels.getLocalizedString('expandAll')}
                collapseTitle={labels.getLocalizedString('collapseAll')}
                canExpand={true}
                canCollapse={true}
                onExpand={() => expansion.expandAll()}
                onCollapse={() => expansion.collapseAll()} />
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
