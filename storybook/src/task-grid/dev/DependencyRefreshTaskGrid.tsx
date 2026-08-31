import React from 'react'
import { DefaultButton, initializeIcons, PrimaryButton, Stack, Text } from '@fluentui/react'
import { createDependenciesModule, MemoryTaskDependencyStrategy, TaskGrid } from '@talxis/base-controls'
import type { IDependenciesProvider, ITaskDependency, ITaskGridServiceLocator } from '@talxis/base-controls'
import { createMemoryTaskGridDescriptor } from '../memoryDescriptor'
import { PARENT_ID_COL, PRIMARY_ID, TASK_DEPENDENCIES, TASKS } from '../memoryTaskData'

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

/**
 * The fixture task with the most dependencies of its own, whichever that happens to be — deleting it is
 * what tests the strategy against the shipped rows rather than against a link this story just made.
 */
const FIXTURE_TASK_ID = [...TASK_DEPENDENCIES
    .flatMap(dependency => [dependency.predecessorTaskId, dependency.successorTaskId])
    .reduce((counts, taskId) => counts.set(taskId, (counts.get(taskId) ?? 0) + 1), new Map<string, number>())]
    .sort((left, right) => right[1] - left[1])[0][0]

/** The row to expand to see it: the parent lookup value carries its subject, so no second lookup. */
const FIXTURE_PARENT_SUBJECT = TASKS
    .find(task => task[PRIMARY_ID] === FIXTURE_TASK_ID)?.[PARENT_ID_COL]?.[0]?.name as string | undefined

/** Every task the fixture links to {@link FIXTURE_TASK_ID}, whose cells should clear when it is deleted. */
const FIXTURE_NEIGHBOUR_IDS = [...new Set(TASK_DEPENDENCIES
    .filter(dependency => dependency.predecessorTaskId === FIXTURE_TASK_ID || dependency.successorTaskId === FIXTURE_TASK_ID)
    .flatMap(dependency => [dependency.predecessorTaskId, dependency.successorTaskId])
    .filter(taskId => taskId !== FIXTURE_TASK_ID))]

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
 * The two deletes test `MemoryTaskDependencyStrategy` instead. Nothing here refreshes anything: the
 * strategy hears `onAfterTasksDeleted` through the locator, splices the rows that pointed at the task out
 * of the array it was handed, and refreshes the provider itself. The cells at the other end of those rows
 * are the proof — they clear without their own row being touched.
 */
export const DependencyRefreshTaskGrid = () => {
    const providerRef = React.useRef<IDependenciesProvider>()
    const fixtureRef = React.useRef<ITaskDependency[]>()
    const servicesRef = React.useRef<ITaskGridServiceLocator>()
    const [deletedTaskIds, setDeletedTaskIds] = React.useState<string[]>([])

    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({
        //the module list still drives which columns the views carry, so the dependency columns show up
        modules: ['dependencies'],
        onGetModuleOverrides: (data) => ({
            onGetDependenciesModule: ({ services }) => {
                //the very array the strategy reads, so a button below can add to it and have the next
                //refresh pick the change up — the same trick the built-in registration uses for views
                fixtureRef.current = data.dependencies
                //the locator the module is built against, so the delete buttons can reach the task side
                servicesRef.current = services
                const module = createDependenciesModule({
                    strategy: new MemoryTaskDependencyStrategy({ dependencies: data.dependencies, services }),
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

    //no refresh call here on purpose: the strategy is listening to the task side for exactly this
    const deleteTask = async (taskId: string) => {
        const result = await servicesRef.current?.get('taskDataProvider').deleteTasks([taskId])
        setDeletedTaskIds(current => [...current, ...(result?.deletedTaskIds ?? [])])
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

    const isDeleted = (taskId: string) => deletedTaskIds.includes(taskId)

    return (
        <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="small">
                <strong>Refresh, one task at a time.</strong> Link <strong>{subjectOf(PREDECESSOR_TASK_ID)}</strong> → <strong>{subjectOf(SUCCESSOR_TASK_ID)}</strong>,
                then refresh <strong>{subjectOf(SUCCESSOR_TASK_ID)}</strong> alone. Watch the
                <em> Successors</em> cell on <strong>{subjectOf(PREDECESSOR_TASK_ID)}</strong> — that row is never refreshed.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                <PrimaryButton text="Link, refresh successor only" onClick={link} disabled={isDeleted(SUCCESSOR_TASK_ID)} />
                <DefaultButton text="Unlink, refresh successor only" onClick={unlink} disabled={isDeleted(SUCCESSOR_TASK_ID)} />
                <DefaultButton text="Refresh successor (no change)" onClick={refreshSuccessorOnly} disabled={isDeleted(SUCCESSOR_TASK_ID)} />
            </Stack>
            <Text variant="small">
                <strong>Delete, nothing else.</strong> Neither button below refreshes anything — the memory strategy hears the
                deletion, drops the rows that pointed at the task, and refreshes the provider itself.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                <DefaultButton
                    text={`Delete ${subjectOf(SUCCESSOR_TASK_ID)} (the link above)`}
                    onClick={() => deleteTask(SUCCESSOR_TASK_ID)}
                    disabled={isDeleted(SUCCESSOR_TASK_ID)}
                />
                <DefaultButton
                    text={`Delete ${subjectOf(FIXTURE_TASK_ID)} (${FIXTURE_NEIGHBOUR_IDS.length} fixture links)`}
                    onClick={() => deleteTask(FIXTURE_TASK_ID)}
                    disabled={isDeleted(FIXTURE_TASK_ID)}
                />
            </Stack>
            <Text variant="small">
                Deleting <strong>{subjectOf(FIXTURE_TASK_ID)}</strong> should clear the dependency cells of{' '}
                {FIXTURE_NEIGHBOUR_IDS.map(subjectOf).join(', ')}
                {FIXTURE_PARENT_SUBJECT && <> — expand <em>{FIXTURE_PARENT_SUBJECT}</em> to see them</>}. Reload the story to start over.
            </Text>
            <TaskGrid descriptor={descriptor} />
        </Stack>
    )
}
