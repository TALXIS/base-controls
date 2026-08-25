import React from 'react'
import { DefaultButton, initializeIcons, PrimaryButton, Stack, Text } from '@fluentui/react'
import { createDependenciesModule, MemoryTaskDependencyStrategy, TaskGrid } from '@talxis/base-controls'
import type { IDependenciesProvider, ITaskDependency, ITaskGridServiceLocator } from '@talxis/base-controls'
import { createMemoryTaskGridDescriptor } from '../memoryDescriptor'
import { PARENT_ID_COL, PRIMARY_ID, TASKS } from '../memoryTaskData'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

const SUBJECT_BY_TASK_ID = new Map(TASKS.map(task => [task[PRIMARY_ID] as string, task.subject as string]))

/**
 * The two root epics. Neither carries a dependency in the fixture — every one of those sits inside Epic
 * 1's children — so both counts start empty, and both rows are visible without expanding anything.
 */
const [SUCCESSOR_TASK_ID, PREDECESSOR_TASK_ID] = TASKS
    .filter(task => task[PARENT_ID_COL] === null)
    .slice(0, 2)
    .map(task => task[PRIMARY_ID] as string)

const DEPENDENCY_ID = 'dev-far-endpoint'

const subjectOf = (taskId: string) => SUBJECT_BY_TASK_ID.get(taskId) ?? taskId

/**
 * The dependency module's refresh, driven one task at a time — the case the grid itself never produces,
 * because its factory always refreshes with every record it loaded.
 *
 * The point of the story is the *far endpoint*. Linking `PREDECESSOR_TASK_ID → SUCCESSOR_TASK_ID` and then
 * refreshing **only the successor** changes two rows: the successor gained a predecessor, and the
 * predecessor gained a successor without ever being asked about. `onAfterDependenciesRefreshed` reports
 * both, and `DependenciesCellRenderer` repaints both — watch the second epic's *Successors* cell.
 *
 * Deleting the successor is the same thing arriving on its own: nothing here refreshes anything, the
 * provider hears `onAfterTasksDeleted` through the locator and refreshes the deleted task itself. Its
 * dependencies go, and the predecessor's cell clears without that row being touched either.
 */
export const DependencyRefreshTaskGrid = () => {
    const providerRef = React.useRef<IDependenciesProvider>()
    const fixtureRef = React.useRef<ITaskDependency[]>()
    const servicesRef = React.useRef<ITaskGridServiceLocator>()
    const [isSuccessorDeleted, setIsSuccessorDeleted] = React.useState(false)

    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({
        //the module list still drives which columns the views carry, so the dependency columns show up
        modules: ['dependencies'],
        onGetModuleOverrides: (data) => ({
            onGetDependenciesModule: (services) => {
                //the very array the strategy reads, so a button below can add to it and have the next
                //refresh pick the change up — the same trick the built-in registration uses for views
                fixtureRef.current = data.dependencies
                //the same locator the module is built against, so the buttons can reach the task side
                servicesRef.current = services
                const module = createDependenciesModule({
                    strategy: new MemoryTaskDependencyStrategy({ dependencies: data.dependencies }),
                    services,
                })
                providerRef.current = module.provider
                return module
            },
        }),
    }), [])

    //refreshes the successor alone on purpose: whether the predecessor's row updates is the whole question
    const refreshSuccessorOnly = () => providerRef.current?.refresh([SUCCESSOR_TASK_ID])

    const link = () => {
        const dependencies = fixtureRef.current
        if (!dependencies || dependencies.some(dependency => dependency.id === DEPENDENCY_ID)) {
            return
        }
        dependencies.push({
            id: DEPENDENCY_ID,
            predecessorTaskId: PREDECESSOR_TASK_ID,
            successorTaskId: SUCCESSOR_TASK_ID,
            type: 'finishToStart',
        })
        refreshSuccessorOnly()
    }

    //no refresh call anywhere here: the provider is listening to the task side for exactly this
    const deleteSuccessor = async () => {
        const result = await servicesRef.current?.get('taskDataProvider').deleteTasks([SUCCESSOR_TASK_ID])
        setIsSuccessorDeleted(!!result?.deletedTaskIds.includes(SUCCESSOR_TASK_ID))
    }

    const unlink = () => {
        const dependencies = fixtureRef.current
        const index = dependencies?.findIndex(dependency => dependency.id === DEPENDENCY_ID) ?? -1
        if (!dependencies || index === -1) {
            return
        }
        dependencies.splice(index, 1)
        refreshSuccessorOnly()
    }

    return (
        <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="small">
                Linking <strong>{subjectOf(PREDECESSOR_TASK_ID)}</strong> → <strong>{subjectOf(SUCCESSOR_TASK_ID)}</strong>,
                then refreshing <strong>{subjectOf(SUCCESSOR_TASK_ID)}</strong> alone. Watch the
                <em> Successors</em> cell on <strong>{subjectOf(PREDECESSOR_TASK_ID)}</strong> — that row is never refreshed.
                Then delete <strong>{subjectOf(SUCCESSOR_TASK_ID)}</strong>: nothing below asks for a refresh, and the
                same cell clears on its own. Reload the story to start over.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 8 }}>
                <PrimaryButton text="Link, refresh successor only" onClick={link} disabled={isSuccessorDeleted} />
                <DefaultButton text="Unlink, refresh successor only" onClick={unlink} disabled={isSuccessorDeleted} />
                <DefaultButton text="Refresh successor (no change)" onClick={refreshSuccessorOnly} disabled={isSuccessorDeleted} />
                <DefaultButton text={`Delete ${subjectOf(SUCCESSOR_TASK_ID)}`} onClick={deleteSuccessor} disabled={isSuccessorDeleted} />
            </Stack>
            <TaskGrid descriptor={descriptor} />
        </Stack>
    )
}
