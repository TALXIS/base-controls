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

const VIEWS: ITaskView[] = [
    { id: 'all', name: 'All tasks', columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete', 'assignedto') },
    { id: 'planning', name: 'Planning', columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), sorting: [{ name: 'scheduledstart', sortDirection: 0 }] },
    { id: 'flat', name: 'Every task on its own', columns: getTaskColumns('subject', 'statuscode', 'assignedto'), isFlatList: true, quickFindColumns: ['subject', 'description'] },
]

const GridExample = () => {
    const strategy = React.useMemo(() => new MemoryTaskStrategy({ records: TASKS, metadata: TASK_METADATA, columns: TASK_COLUMNS }), [])
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), [])

    const onLoad = async ({ viewId }: { viewId?: string }) => {
        const view = VIEWS.find(view => view.id === viewId) ?? VIEWS[0]
        return { provider: new TaskDataProvider({ strategy, fieldMapping, view }), viewId: view.id }
    }

    return <DatasetControl stateKey='devTasks' height='600px' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher onLoad={async () => VIEWS} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.Ribbon />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskGridDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid stateKey='taskGrid' enableRowDragging enableTaskCreation modules={modules} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

/** Phase 1 of the task grid, as the code a consumer writes, over memory tasks. */
export const CoreTaskGrid = () => <GridExampleRunner seedCode={CORE_CODE} />
