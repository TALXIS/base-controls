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

/** Expands or collapses the tasks a level at a time. */
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
                expandTitle={labels.getLocalizedString('expandLevel')}
                collapseTitle={labels.getLocalizedString('collapseLevel')}
                canExpand={expansion.canExpandLevel()}
                canCollapse={expansion.canCollapseLevel()}
                onExpand={() => expansion.expandLevel()}
                onCollapse={() => expansion.collapseLevel()}
                components={components.expandCollapse} />
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
