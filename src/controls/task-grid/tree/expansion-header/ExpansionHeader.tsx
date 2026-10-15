import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDataProviderEvents } from "@utils";
import { Grid, GroupingUi, IColumnHeaderParams } from "@controls/grid";
import { useTaskGridService } from "../../useTaskGrid";
import { useTaskGridContext } from "../../context";
import type { ITaskExpansionEvents } from "../TaskExpansion";
import { IExpansionHeaderComponents } from "./components";

export interface IExpansionHeaderProps extends IColumnHeaderParams {
    components?: IExpansionHeaderComponents;
}

/** Expands or collapses every task at once. */
export const ExpansionHeader = (props: IExpansionHeaderProps) => {
    const { runtime, components: taskGridComponents } = useTaskGridContext();
    const expansion = useTaskGridService('taskExpansion');
    const components = { ...taskGridComponents.expansionHeader, ...props.components };
    const labels = runtime.getLabels();
    const { rerender } = useRerender();
    useDataProviderEvents(['onNewDataLoaded']);
    useEventEmitter<ITaskExpansionEvents>(expansion.events, 'onExpansionChanged', rerender);

    //no container: the column has no menu to make room for
    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme>
            <GroupingUi.ExpandCollapse
                expandTitle={labels.getLocalizedString('expandAll')}
                collapseTitle={labels.getLocalizedString('collapseAll')}
                canExpand={true}
                canCollapse={expansion.getExpandedIds().length > 0}
                onExpand={() => expansion.expandAll()}
                onCollapse={() => expansion.collapseAll()}
                components={components.expandCollapse} />
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
