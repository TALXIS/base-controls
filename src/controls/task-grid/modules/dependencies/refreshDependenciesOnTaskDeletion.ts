import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/**
 * Wires a dependency strategy to the task side: after a delete, the provider reloads the deleted tasks,
 * which drops the dependencies that pointed at them and reports the tasks at the other end as affected —
 * so their cells repaint without their own rows being touched.
 *
 * Waits for the task provider rather than resolving it: the grid builds its modules before it, so there is
 * nothing to reach at the point a strategy is constructed. Call this from the constructor.
 *
 * @param onTasksDeleted Runs before the refresh, for a strategy holding its own rows. The refresh reads
 * back through `onGetDependencies`, so anything still there by then comes straight back.
 */
export const refreshDependenciesOnTaskDeletion = (
    services: ITaskGridServiceLocator,
    onTasksDeleted?: (deletedTaskIds: string[]) => void,
): void => {
    services.whenAvailable('taskDataProvider', ({ taskEvents }) => {
        taskEvents.addEventListener('onAfterTasksDeleted', async result => {
            //null when the delete was cancelled or failed outright. A partial failure still lists what did
            //go, and those tasks are just as deleted, so the length is the gate rather than `success`
            if (!result?.deletedTaskIds.length) {
                return;
            }
            onTasksDeleted?.(result.deletedTaskIds);
            //resolved here, not at wiring time: the module is registered after the strategy it was built from
            await services.get('dependenciesModule').provider.refresh(result.deletedTaskIds);
        });
    });
};
