import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { useDataProviderEvents } from "@data";
import { Grid, GroupingUi, IColumnHeaderParams } from "@controls/grid";
import { useTaskGridService } from "../../useTaskGridServices";
import { useTaskGridContext } from "../../context";
import { TASK_GRID_LABELS } from "../../labels";
import type { ITaskDataProviderEvents } from "../../runtime/provider";
import type { ITaskExpansionEvents } from "../../runtime/tree/TaskExpansion";
import { mergeComponentNamespaces } from "../mergeComponentNamespaces";
import { IExpansionHeaderComponents } from "./components";

export interface IExpansionHeaderProps extends IColumnHeaderParams {
    components?: IExpansionHeaderComponents;
}

/** Expands or collapses the tasks a level at a time. */
export const ExpansionHeader = (props: IExpansionHeaderProps) => {
    const { components: taskGridComponents } = useTaskGridContext();
    const expansion = useTaskGridService('taskExpansion');
    const provider = useTaskGridService('provider');
    const components = mergeComponentNamespaces(taskGridComponents.expansionHeader, props.components);
    const labels = useLabels(TASK_GRID_LABELS);
    const { rerender } = useRerender();
    useDataProviderEvents(['onNewDataLoaded']);
    useEventEmitter<ITaskExpansionEvents>(expansion.events, 'onExpansionChanged', rerender);
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTreeChanged', rerender);

    //the column has no menu to make room for
    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme>
            <GroupingUi.ExpandCollapse
                expandTitle={labels.get('taskGrid.expandLevel')}
                collapseTitle={labels.get('taskGrid.collapseLevel')}
                canExpand={expansion.canExpandLevel()}
                canCollapse={expansion.canCollapseLevel()}
                onExpand={() => expansion.expandLevel()}
                onCollapse={() => expansion.collapseLevel()}
                components={components.expandCollapse} />
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
