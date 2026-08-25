import * as React from "react";
import { ICellProps } from "@components/Grid/cells/cell/Cell";
import { useServices } from "@components/TaskGrid/context";
import { getDependenciesCellRendererStyles } from "./styles";

/**
 * Renders a task's dependencies. `GridCustomizer` wires this in for any column carrying the
 * `TaskDependencies` custom control, but only once the `dependencies` module is registered — this
 * component is what that module contributes as its `components.CellRenderer`.
 *
 * Placeholder: it reports how many dependencies the task has in each direction. What goes here is a chip
 * per dependency — the other task, and an icon per `TaskDependencyType` showing which end of each task
 * the link attaches to — in both directions.
 */
export const DependenciesCellRenderer = (props: ICellProps) => {
    const services = useServices();
    const styles = React.useMemo(() => getDependenciesCellRendererStyles(), []);
    const provider = services.find('dependenciesModule')?.provider;
    const taskId = props.record.getRecordId();
    const predecessorCount = provider?.getPredecessors(taskId).length ?? 0;
    const successorCount = provider?.getSuccessors(taskId).length ?? 0;

    if (predecessorCount === 0 && successorCount === 0) {
        return null;
    }
    return <div className={styles.root}>
        {[
            predecessorCount > 0 && `${predecessorCount} predecessor${predecessorCount > 1 ? 's' : ''}`,
            successorCount > 0 && `${successorCount} successor${successorCount > 1 ? 's' : ''}`,
        ].filter(Boolean).join(' · ')}
    </div>
}
