import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const CORE_CODE = `const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    percentComplete: 'percentcomplete',
}

//the task grid reads isFlatList from a view's data
const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}, onResolve?: (provider: ITaskDataProvider) => void): ITaskGridView => ({
    id,
    name,
    resolve: provider => {
        onResolve?.(provider)
        return { columns, data }
    },
})

const VIEWS: ITaskGridView[] = [
    taskView('all', 'All tasks', getTaskColumns('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS), {}, provider => provider.setQuickFindColumns(['subject', 'assignedto', 'tags', 'teams'])),
    taskView('planning', 'Planning', getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), {}, provider => provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])),
    taskView('flat', 'Every task on its own', getTaskColumns('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true }, provider => provider.setQuickFindColumns(['subject', 'description', 'assignedto'])),
]

//one call in four of a wrapped object fails while the toggle above the grid is on
const chaos = { isOn: true, rate: 0.25 }

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

//wraps every method so it may fail instead of running: an async one rejects, a sync one throws
const withRandomFailures = <T extends object>(target: T, name: string): T => new Proxy(target, {
    get: (object, key, receiver) => {
        const value = Reflect.get(object, key, receiver)
        if (typeof value !== 'function') {
            return value
        }
        return (...args: unknown[]) => {
            if (!chaos.isOn || Math.random() >= chaos.rate) {
                return value.apply(object, args)
            }
            const error = new Error(\`\${name}.\${String(key)} failed at random.\`)
            if (value.constructor.name !== 'AsyncFunction') {
                throw error
            }
            return (async () => {
                await wait(400)
                throw error
            })()
        }
    },
})

const GridExample = () => {
    const [isChaosOn, setIsChaosOn] = React.useState(chaos.isOn)
    const taskTable = React.useMemo(() => new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: TASKS }), [])
    const templates = React.useMemo(() => withRandomFailures(new MemoryTable({ idKey: 'id', rows: TEMPLATES }), 'templates'), [])
    const lookupManyValues = React.useMemo(() => withRandomFailures(new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES }), 'lookupManyValues'), [])
    const checklistItems = React.useMemo(() => withRandomFailures(new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS }), 'checklistItems'), [])
    const dependencies = React.useMemo(() => withRandomFailures(new MemoryTable({ idKey: 'id', rows: DEPENDENCIES }), 'dependencies'), [])
    const modules = React.useMemo(() => [
        createRowSelectionModule({ mode: 'multiple' }),
        createTaskEditingModule(),
        createSortingModule(),
        createFilteringModule(),
    ], [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'devTasks.userViews' }),
        createMemoryProjectModule({ projects: new MemoryTable({ idKey: 'id', rows: [{ id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' }] }), projectId: 'website' }),
        createTaskDraggingModule(),
        createMemoryCustomColumnsModule({
            columns: new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [{ name: 'risk', displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }] }),
            values: new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId' }),
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: lookupManyValues }),
        createMemoryTemplatesModule({ tasks: taskTable, templates }),
        createMemoryTaskChecklistModule({ items: checklistItems }),
        createMemoryDependenciesModule({ dependencies }),
    ], [taskTable])

    const onLoad = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
        const store = new MemoryTaskStore({ taskRuntime, tasks: taskTable, metadata: TASK_METADATA, columns: TASK_COLUMNS })
        return { store: withRandomFailures(store, 'taskStore'), fieldMapping, views: VIEWS }
    }

    const onChaosChanged = (isOn: boolean) => {
        chaos.isOn = isOn
        setIsChaosOn(isOn)
    }

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
        <Toggle label='Random failures (1 in 4 store and table calls)' inlineLabel checked={isChaosOn} onChange={(_, checked) => onChaosChanged(!!checked)} />
        <div style={{ flex: 1, minHeight: 0 }}>
            <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion stateKey='devTasks' height='100%' onLoad={onLoad}>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher>
                            <DatasetControl.UserQueries />
                        </DatasetControl.ViewSwitcher>
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <TaskDatasetControl.Ribbon />
                        <DatasetControl.EditColumns />
                        <DatasetControl.QuickFind />
                        <TaskDatasetControl.Settings />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Notifications />
                <DatasetControl.Body>
                    <TaskGrid stateKey='taskGrid' modules={modules} />
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.Start>
                        <TaskDatasetControl.PageSizeSwitcher />
                    </DatasetControl.Footer.Start>
                </DatasetControl.Footer>
            </TaskDatasetControl>
        </div>
    </div>
}
`

/** Phase 1 of the task grid, as the code a consumer writes, over memory tasks. */
export const CoreTaskGrid = () => <GridExampleRunner seedCode={CORE_CODE} />
