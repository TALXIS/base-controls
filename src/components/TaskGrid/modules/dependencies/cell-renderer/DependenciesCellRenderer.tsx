import * as React from "react";
import { Icon, useTheme } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ICellProps } from "@components/Grid/cells/cell/Cell";
import { useServices } from "@components/TaskGrid/context";
import { getDependenciesCellRendererStyles } from "./styles";
import type { TaskDependencyDirection } from "../DependenciesProvider";

export interface IDependenciesCellRendererProps extends ICellProps {
    /** Which side of the dependency this column shows. Bound per column by the grid. */
    direction: TaskDependencyDirection;
}

/**
 * Renders how many dependencies a task has in one direction: a link glyph, an arrow for the direction, and
 * the count. Empty when the task has none.
 *
 * `GridCustomizer` wires this in for the grid's predecessors and successors columns, binding `direction`
 * per column — this component is what the `dependencies` module contributes as its `components.CellRenderer`.
 */
export const DependenciesCellRenderer = (props: IDependenciesCellRendererProps) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getDependenciesCellRendererStyles(theme), [theme]);
    //get, not find: the column this renders in only exists because the module does
    const provider = useServices().get('dependenciesModule').provider;
    const taskId = props.record.getRecordId();
    const rerender = useRerender();
    //the event carries every affected task, so each cell picks out its own — including when the change came
    //from a refresh of the task at the other end of the dependency
    useEventEmitter(provider.events, 'onAfterDependenciesRefreshed', (affectedTaskIds: string[]) => {
        if (affectedTaskIds.includes(taskId)) {
            rerender();
        }
    });
    const dependencies = props.direction === 'predecessors' ? provider.getPredecessors(taskId) : provider.getSuccessors(taskId);

    if (dependencies.length === 0) {
        return null;
    }
    return <div className={styles.root}>
        <Icon iconName="Link" className={styles.icon} />
        <Icon iconName={props.direction === 'predecessors' ? 'SortDown' : 'SortUp'} className={styles.arrow} />
        <span>{dependencies.length}</span>
    </div>
}
