import * as React from "react";
import { Icon, Text, useTheme } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ICellProps } from "@components/Grid/cells/cell/Cell";
import { useServices } from "@components/TaskGrid/context";
import { getChecklistCellRendererStyles } from "./styles";

export interface IChecklistCellRendererProps extends ICellProps { }

/**
 * Renders how far a task's checklist has got: a circled check and `done/total`. Empty when the task has no
 * items.
 *
 * Finished checklists are the ones worth spotting, so only they get the filled green check; anything still
 * outstanding stays an outline in the quieter subtext colour. That reads at a glance without comparing the
 * two numbers.
 *
 * `GridCustomizer` wires this in for the grid's checklist column — this component is what the `checklist`
 * module contributes as its `components.CellRenderer`.
 */
export const ChecklistCellRenderer = (props: IChecklistCellRendererProps) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getChecklistCellRendererStyles(theme), [theme]);
    //get, not find: the column this renders in only exists because the module does
    const provider = useServices().get('checklistModule').provider;
    const taskId = props.record.getRecordId();
    const rerender = useRerender();
    //the event carries every task the refresh reloaded, so each cell picks out its own
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
    const isCompleted = completedCount === items.length;
    return <div className={styles.root}>
        <Icon
            iconName={'Completed'}
            className={isCompleted ? styles.iconCompleted : styles.icon}
        />
        <Text>{completedCount}/{items.length}</Text>
    </div>
}
